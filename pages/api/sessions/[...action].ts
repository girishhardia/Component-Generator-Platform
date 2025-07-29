import type { NextApiResponse } from "next";
import withAuth, { NextApiRequestWithUser } from "@/middleware/withAuth";
import dbConnect from "@/lib/dbConnect";
import SessionModel from "@/models/SessionModel";
import UserModel from "@/models/UserModel";

const handler = async (req: NextApiRequestWithUser, res: NextApiResponse) => {
  const { method } = req;
  const userId = req.userId; // Provided by withAuth middleware
  const { action, id } = req.query; // action is an array from the [...slug] route

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, error: "User not authenticated." });
  }

  if (!action || !Array.isArray(action)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid or missing action parameter." });
  }

  await dbConnect();

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const actionName = action[0];

    switch (`${method}:${actionName}`) {
      case "POST:create":
        const newSession = await SessionModel.create({
          userId,
          name: req.body.name || "New Project",
        });
        return res.status(201).json({ success: true, data: newSession });

      case "GET:list":
        const sessions = await SessionModel.find({ userId })
          .select("name createdAt")
          .sort({ updatedAt: -1 });
        return res.status(200).json({ success: true, data: sessions });

      case "GET:details":
        const sessionId = action[1];
        if (!sessionId)
          return res
            .status(400)
            .json({ success: false, error: "Session ID missing" });

        const session = await SessionModel.findOne({ _id: sessionId, userId });
        if (!session)
          return res
            .status(404)
            .json({ success: false, error: "Session not found" });

        return res.status(200).json({ success: true, data: session });

      case "PUT:update":
        const updateId = action[1];
        if (!updateId)
          return res
            .status(400)
            .json({ success: false, error: "Session ID missing" });

        const { name, chatHistory, generatedCode } = req.body;
        const updatedSession = await SessionModel.findOneAndUpdate(
          { _id: updateId, userId },
          { name, chatHistory, generatedCode },
          { new: true, runValidators: true }
        );

        if (!updatedSession)
          return res
            .status(404)
            .json({ success: false, error: "Session not found" });

        return res.status(200).json({ success: true, data: updatedSession });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        return res
          .status(405)
          .end(`Method ${method} Not Allowed on route ${actionName}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return res
      .status(500)
      .json({ success: false, error: `Server Error: ${errorMessage}` });
  }
};

// Wrap the handler with our authentication middleware
export default withAuth(handler);
