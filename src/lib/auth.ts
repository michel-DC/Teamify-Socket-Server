"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

/**
 * @param userUid - L'UID unique de l'utilisateur
 *
 * Génère un token JWT pour l'authentification
 */
export async function generateToken(userUid: string) {
  return jwt.sign({ userUid }, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * @param token - Le token JWT à vérifier
 *
 * Vérifie et décode un token JWT
 */
export async function verifyToken(
  token: string
): Promise<{ userUid: string } | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as { userUid: string };
  } catch {
    return null;
  }
}

/**
 * Récupère l'utilisateur actuellement connecté via le token
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);

    if (!payload?.userUid) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { uid: payload.userUid },
    });

    return user;
  } catch (error) {
    console.error(
      "[getCurrentUser] Erreur lors de la récupération de l'utilisateur:",
      error
    );
    return null;
  }
}

/**
 * Vérifie si un utilisateur a accès à une organisation (propriétaire OU membre)
 * @param userUid - L'UID de l'utilisateur
 * @param organizationId - L'ID de l'organisation
 * @returns true si l'utilisateur a accès, false sinon
 */
export async function hasOrganizationAccess(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  try {
    // Vérifier si l'utilisateur est propriétaire
    const isOwner = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: userUid,
      },
    });

    if (isOwner) {
      return true;
    }

    // Vérifier si l'utilisateur est membre
    const isMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId,
          userUid,
        },
      },
    });

    return !!isMember;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification d'accès à l'organisation:",
      error
    );
    return false;
  }
}

/**
 * Vérifie si un utilisateur est propriétaire d'une organisation
 * @param userUid - L'UID de l'utilisateur
 * @param organizationId - L'ID de l'organisation
 * @returns true si l'utilisateur est propriétaire, false sinon
 */
export async function isOrganizationOwner(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerUid: userUid,
      },
    });

    return !!organization;
  } catch (error) {
    console.error("Erreur lors de la vérification de propriété:", error);
    return false;
  }
}

/**
 * @param Vérifie si un utilisateur a un rôle spécifique dans une organisation
 *
 * Récupère le rôle de l'utilisateur dans l'organisation et le compare au rôle demandé
 */
export async function hasOrganizationRole(
  userUid: string,
  organizationId: number,
  requiredRole: "OWNER" | "ADMIN" | "MEMBER"
): Promise<boolean> {
  try {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId,
          userUid,
        },
      },
      select: { role: true },
    });

    if (!member) return false;

    // Hiérarchie des rôles : OWNER > ADMIN > MEMBER
    const roleHierarchy = {
      OWNER: 3,
      ADMIN: 2,
      MEMBER: 1,
    };

    const userRoleLevel = roleHierarchy[member.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle:", error);
    return false;
  }
}

/**
 * @param Vérifie si un utilisateur peut modifier une organisation
 *
 * Seuls les OWNER et ADMIN peuvent modifier une organisation
 */
export async function canModifyOrganization(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  return hasOrganizationRole(userUid, organizationId, "ADMIN");
}

/**
 * @param Vérifie si un utilisateur peut supprimer une organisation
 *
 * Seuls les OWNER peuvent supprimer une organisation
 */
export async function canDeleteOrganization(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  return hasOrganizationRole(userUid, organizationId, "OWNER");
}

/**
 * @param Vérifie si un utilisateur peut modifier un événement
 *
 * Seuls les OWNER et ADMIN peuvent modifier un événement
 */
export async function canModifyEvent(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  return hasOrganizationRole(userUid, organizationId, "ADMIN");
}

/**
 * @param Vérifie si un utilisateur peut supprimer un événement
 *
 * Seuls les OWNER peuvent supprimer un événement
 */
export async function canDeleteEvent(
  userUid: string,
  organizationId: number
): Promise<boolean> {
  return hasOrganizationRole(userUid, organizationId, "OWNER");
}

/**
 * @param Récupère le rôle d'un utilisateur dans une organisation
 *
 * Retourne le rôle de l'utilisateur ou null s'il n'est pas membre
 */
export async function getUserOrganizationRole(
  userUid: string,
  organizationId: number
): Promise<"OWNER" | "ADMIN" | "MEMBER" | null> {
  try {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId,
          userUid,
        },
      },
      select: { role: true },
    });

    return member?.role || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return null;
  }
}

/**
 * @param Récupère le rôle d'un utilisateur dans une organisation par publicId
 *
 * Retourne le rôle de l'utilisateur ou null s'il n'est pas membre
 */
export async function getUserOrganizationRoleByPublicId(
  userUid: string,
  organizationPublicId: string
): Promise<"OWNER" | "ADMIN" | "MEMBER" | null> {
  try {
    // D'abord, récupérer l'organisation par son publicId
    const organization = await prisma.organization.findUnique({
      where: { publicId: organizationPublicId },
      select: { id: true, ownerUid: true },
    });

    if (!organization) {
      return null;
    }

    // Vérifier d'abord si l'utilisateur est le propriétaire direct
    if (organization.ownerUid === userUid) {
      return "OWNER";
    }

    // Ensuite, récupérer le rôle de l'utilisateur depuis la table des membres
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userUid: {
          organizationId: organization.id,
          userUid,
        },
      },
      select: { role: true },
    });

    return member?.role || null;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du rôle par publicId:",
      error
    );
    return null;
  }
}
