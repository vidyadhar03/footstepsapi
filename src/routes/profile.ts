import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/auth';
import prisma from '../lib/prisma';

const router = Router();


router.get("/user/profile", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        timestamp: new Date().toISOString()
      });
    }
    
    // Find user and userInfo by authUserId
    const userData = await prisma.user.findUnique({
      where: { authUserId: user.uid },
      include: {
        userInfo: true
      }
    });

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
        timestamp: new Date().toISOString()
      });
    }

    // Combine user and userInfo data
    const profileData = {
      id: userData.id,
      authUserId: userData.authUserId,
      name: userData.name,
      email: userData.email,
      origin: userData.userInfo?.originCountry || null,
      styleTags: userData.userInfo?.travelStyleTags || [],
      totalKm: userData.userInfo?.totalKmTravelled || 0,
      totalCountries: userData.userInfo?.totalCountries || 0,
      bio: userData.userInfo?.bio || null,
      avatarUrl: userData.userInfo?.avatarUrl || null,
      timezone: userData.userInfo?.timezone || "Asia/Kolkata",
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };

    return res.json({
      success: true,
      data: profileData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      timestamp: new Date().toISOString()
    });
  }
});


router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        timestamp: new Date().toISOString()
      });
    }

    // Extract profile data from request body
    const {
      name,
      email,
      origin,
      styleTags,
      totalKm,
      totalCountries,
      bio,
      avatarUrl,
      timezone
    } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Name is required and must be a string",
        timestamp: new Date().toISOString()
      });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Email is required and must be a string",
        timestamp: new Date().toISOString()
      });
    }

    // Validate optional fields with defaults
    const userData = {
      name: name.trim(),
      email: email.trim(),
    };

    const userInfoData = {
      originCountry: origin || null,
      travelStyleTags: Array.isArray(styleTags) ? styleTags : [],
      totalKmTravelled: typeof totalKm === 'number' ? totalKm : 0,
      totalCountries: typeof totalCountries === 'number' ? totalCountries : 0,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      timezone: timezone || "Asia/Kolkata"
    };

    // Upsert user and userInfo using Prisma
    const result = await prisma.$transaction(async (tx) => {
      // First, upsert the user
      const userRecord = await tx.user.upsert({
        where: { 
          authUserId: user.uid 
        },
        update: {
          name: userData.name,
          email: userData.email,
          updatedAt: new Date()
        },
        create: {
          authUserId: user.uid,
          name: userData.name,
          email: userData.email
        }
      });

      // Then, upsert the userInfo
      const userInfo = await tx.userInfo.upsert({
        where: { 
          userId: userRecord.id 
        },
        update: {
          originCountry: userInfoData.originCountry,
          travelStyleTags: userInfoData.travelStyleTags,
          totalKmTravelled: userInfoData.totalKmTravelled,
          totalCountries: userInfoData.totalCountries,
          bio: userInfoData.bio,
          avatarUrl: userInfoData.avatarUrl,
          timezone: userInfoData.timezone,
          updatedAt: new Date()
        },
        create: {
          userId: userRecord.id,
          originCountry: userInfoData.originCountry,
          travelStyleTags: userInfoData.travelStyleTags,
          totalKmTravelled: userInfoData.totalKmTravelled,
          totalCountries: userInfoData.totalCountries,
          bio: userInfoData.bio,
          avatarUrl: userInfoData.avatarUrl,
          timezone: userInfoData.timezone
        }
      });

      return { user: userRecord, userInfo };
    });

    // Combine the data for response
    const profileData = {
      id: result.user.id,
      authUserId: result.user.authUserId,
      name: result.user.name,
      email: result.user.email,
      origin: result.userInfo.originCountry,
      styleTags: result.userInfo.travelStyleTags,
      totalKm: result.userInfo.totalKmTravelled,
      totalCountries: result.userInfo.totalCountries,
      bio: result.userInfo.bio,
      avatarUrl: result.userInfo.avatarUrl,
      timezone: result.userInfo.timezone,
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt
    };

    return res.json({
      success: true,
      message: result.user.createdAt.getTime() === result.user.updatedAt.getTime() 
        ? "Profile created successfully" 
        : "Profile updated successfully",
      data: profileData,
      isNewProfile: result.user.createdAt.getTime() === result.user.updatedAt.getTime(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Upsert user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 