import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });

    // setTimeout(() => {
    res.status(200).json(posts);
    // }, 3000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          // Fix 1: Return here to prevent the code from continuing
          return res.status(200).json({ ...post, isSaved: saved ? true : false });
        }
        // Fix 2: If there's an error with the token, send a response and return
        return res.status(200).json({ ...post, isSaved: false });
      });
    } else {
      // Fix 3: If no token exists, send the response here and return
      res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  // Seuls les propriétaires peuvent créer une annonce
  if (!req.isProprietaire) {
    return res.status(403).json({ message: "Seuls les propriétaires peuvent créer une annonce" });
  }

  // Validation for required fields
  if (!body.postData || !body.postDetail) {
    return res.status(400).json({ message: "postData and postDetail are required!" });
  }

  const { postData, postDetail } = body;

  // Validate required postData fields
  if (!postData.title || !postData.price || !postData.address || !postData.city || 
      !postData.bedroom || !postData.bathroom || !postData.type || !postData.property) {
    return res.status(400).json({ message: "Missing required fields: title, price, address, city, bedroom, bathroom, type, property" });
  }

  // Validate required postDetail fields
  if (!postDetail.desc) {
    return res.status(400).json({ message: "Description is required!" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        ...postData,
        userId: tokenUserId,
        postDetail: {
          create: postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const body = req.body;

  try {
    // Check if post exists and user owns it
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...body.postData,
        postDetail: body.postDetail ? {
          update: body.postDetail,
        } : undefined,
      },
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    // Delete dependent records first to satisfy required relation
    await prisma.postDetail.deleteMany({
      where: { postId: id },
    });

    await prisma.savedPost.deleteMany({
      where: { postId: id },
    });

    await prisma.chat.deleteMany({
      where: { postId: id },
    }).catch(() => {});

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};