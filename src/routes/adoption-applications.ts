import crypto from "node:crypto";
import { Router, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";
import { auth } from "../auth.js";
import db from "../lib/db.js";
import { adoptionApplication } from "../lib/schema.js";

const router = Router();

// ── Scoring Logic ──────────────────────────────────────────────────────────

function computeScore(data: Record<string, unknown>) {
  let score = 0;

  // homeType
  switch (data.homeType) {
    case "House":
      score += 10;
      break;
    case "Condo":
      score += 5;
      break;
    case "Apartment":
      score += 3;
      break;
    default:
      score += 1;
  }

  // renting
  score += data.renting === false ? 10 : 3;

  // familySupport
  score += data.familySupport === true ? 10 : 0;

  // pastPets
  score += data.pastPets === true ? 10 : 3;

  // hoursAlone
  const hours = parseInt(String(data.hoursAlone || "0"), 10);
  if (hours < 4) score += 10;
  else if (hours <= 8) score += 5;
  else score += 2;

  // allergies
  score += data.allergies === false ? 10 : 2;

  // meetAndGreetAvailable
  score += data.meetAndGreetAvailable === true ? 10 : 0;

  // caretaker provided
  if (data.caretaker && String(data.caretaker).trim().length > 0) score += 10;

  // emergencyCaretaker provided
  if (
    data.emergencyCaretaker &&
    String(data.emergencyCaretaker).trim().length > 0
  )
    score += 5;

  // adoptedBefore has meaningful content
  if (data.adoptedBefore && String(data.adoptedBefore).trim().length > 10)
    score += 10;

  // financialResponsibility provided
  if (
    data.financialResponsibility &&
    String(data.financialResponsibility).trim().length > 0
  )
    score += 10;

  return score;
}

function scoreCategory(score: number): string {
  if (score >= 80) return "Highly Suitable";
  if (score >= 50) return "Moderate";
  return "Needs Review";
}

// ── Auth Helper ────────────────────────────────────────────────────────────

async function getAuthUser(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return session?.user ?? null;
}

// ── GET /adoption-applications/me ──────────────────────────────────────────

router.get("/me", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const [application] = await db
      .select()
      .from(adoptionApplication)
      .where(eq(adoptionApplication.userId, user.id))
      .limit(1);

    if (!application) {
      res.json(null);
      return;
    }

    res.json(application);
  } catch (err) {
    console.error("Get adoption application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /adoption-applications ────────────────────────────────────────────

router.post("/", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Check if user already has an application
    const [existing] = await db
      .select()
      .from(adoptionApplication)
      .where(eq(adoptionApplication.userId, user.id))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "Application already exists" });
      return;
    }

    const body = req.body;
    const total = computeScore(body);
    const category = scoreCategory(total);
    const id = crypto.randomUUID();

    const [created] = await db
      .insert(adoptionApplication)
      .values({
        id,
        userId: user.id,
        // Personal Info
        name: body.name,
        address: body.address,
        phone: body.phone,
        gmailName: body.gmailName ?? null,
        email: body.email,
        birthdate: body.birthdate,
        occupation: body.occupation,
        companyName: body.companyName ?? null,
        socialMediaProfile: body.socialMediaProfile ?? null,
        // Identity
        status: body.status,
        pronouns: body.pronouns,
        // Adoption Motivation
        whatPromptedToAdopt: body.whatPromptedToAdopt,
        adoptedBefore: body.adoptedBefore,
        // Pet Preference
        petType: body.petType,
        specificAnimal: body.specificAnimal ?? false,
        idealPetDescription: body.idealPetDescription ?? null,
        // Living Situation
        homeType: body.homeType,
        renting: body.renting ?? false,
        relocationPlan: body.relocationPlan ?? null,
        householdMembers: body.householdMembers
          ? JSON.stringify(body.householdMembers)
          : null,
        allergies: body.allergies ?? false,
        // Responsibility
        caretaker: body.caretaker,
        financialResponsibility: body.financialResponsibility,
        emergencyCaretaker: body.emergencyCaretaker,
        hoursAlone: body.hoursAlone,
        introductionPlan: body.introductionPlan ?? null,
        // Household Decision
        familySupport: body.familySupport ?? true,
        familySupportExplanation: body.familySupportExplanation ?? null,
        otherPets: body.otherPets ?? false,
        pastPets: body.pastPets ?? false,
        // Uploads
        houseFront: body.houseFront ?? null,
        street: body.street ?? null,
        livingRoom: body.livingRoom ?? null,
        diningArea: body.diningArea ?? null,
        kitchen: body.kitchen ?? null,
        bedroom: body.bedroom ?? null,
        windows: body.windows ?? null,
        yard: body.yard ?? null,
        validID: body.validID ?? null,
        // Interview
        meetAndGreetAvailable: body.meetAndGreetAvailable ?? true,
        preferredDate: body.preferredDate ?? null,
        preferredTime: body.preferredTime ?? null,
        // Score
        totalScore: total,
        scoreCategory: category,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    console.error("Create adoption application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PATCH /adoption-applications/:id ───────────────────────────────────────

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(adoptionApplication)
      .where(eq(adoptionApplication.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    if (existing.userId !== user.id) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    // Merge existing with updates for score computation
    const merged = { ...existing, ...req.body };
    const total = computeScore(merged);
    const category = scoreCategory(total);

    const updateData: Record<string, unknown> = {
      ...req.body,
      totalScore: total,
      scoreCategory: category,
      updatedAt: new Date(),
    };

    // Stringify householdMembers if it's an array
    if (Array.isArray(updateData.householdMembers)) {
      updateData.householdMembers = JSON.stringify(
        updateData.householdMembers
      );
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;

    const [updated] = await db
      .update(adoptionApplication)
      .set(updateData)
      .where(eq(adoptionApplication.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error("Update adoption application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /adoption-applications/:id ──────────────────────────────────────

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(adoptionApplication)
      .where(eq(adoptionApplication.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    if (existing.userId !== user.id) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    await db
      .delete(adoptionApplication)
      .where(eq(adoptionApplication.id, id));

    res.json({ success: true });
  } catch (err) {
    console.error("Delete adoption application error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
