import db from "../utils/db";
import { Response, Request } from "express";
import { sendError, sendSuccess } from "../utils/network";

const getAllMedia = async (req: Request, res: Response) => {
  const media = await db.media.findMany({
    where: {
      uploadedUser: {
        id: req.user!.id,
      }
    },    
  });
  const transformedMedia = media.map((item) => {
    return {
      ...item,
      url: `${process.env.BASE_URL}/${item.url}`,
    };
  }
  );
  sendSuccess(res, transformedMedia);
};

const getMediaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const media = await db.media.findUnique({
    where: {
      id: id,
    },
  });
  if (!media) {
    sendError(res, "Media not found", 404);
    return;
  }
  sendSuccess(res, media);
};

const createMedia = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { filename, mimetype, path } = req.file;

  try {
    const media = await db.media.create({
      data: {
        title: filename,
        type: "UPLOAD",
        reference: filename + Date.now().toString(),
        url: path,
        uploadedUser: {
            connect: {
                id: req.user!.id,
            },
        }
      },
    });

    sendSuccess(res, media, "Media uploaded successfully", 201);
  } catch (error) {
    sendError(res, "Error uploading media", 500);
  }
};

const deleteMedia = async (req: Request, res: Response) => {
  const { id } = req.params;
  const response = await db.media.delete({
    where: {
      id: id,
    },
  });
  sendSuccess(res, response, "Media deleted successfully", 204);
};

const mediaController = {
  getAllMedia,
  createMedia,
  deleteMedia,
};

export default mediaController;
