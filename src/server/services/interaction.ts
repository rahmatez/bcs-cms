import { prisma } from "@/lib/prisma";
import { CommentStatus, PollStatus, RefType } from "@prisma/client";
import { z } from "zod";

export const commentSchema = z.object({
  refType: z.nativeEnum(RefType),
  refId: z.string(),
  body: z.string().min(4)
});

export async function submitComment({
  userId,
  input
}: {
  userId: string;
  input: z.infer<typeof commentSchema>;
}) {
  const payload = commentSchema.parse(input);

  return prisma.comment.create({
    data: {
      userId,
      refType: payload.refType,
      refId: payload.refId,
      body: payload.body,
      status: CommentStatus.PENDING
    }
  });
}

export async function listComments({
  refType,
  refId
}: {
  refType: RefType;
  refId: string;
}) {
  return prisma.comment.findMany({
    where: { refType, refId, status: CommentStatus.APPROVED },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } }
  });
}

export async function listAllComments({
  status
}: {
  status?: CommentStatus | "ALL";
}) {
  return prisma.comment.findMany({
    where: {
      ...(status && status !== "ALL" ? { status } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } }
    }
  });
}

export async function moderateComment({
  commentId,
  status
}: {
  commentId: string;
  status: CommentStatus;
}) {
  return prisma.comment.update({
    where: { id: commentId },
    data: { status }
  });
}

export const pollSchema = z.object({
  question: z.string().min(4),
  options: z.array(z.object({ key: z.string(), label: z.string() })).min(2),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional()
});

export async function upsertPoll({
  pollId,
  input
}: {
  pollId?: string;
  input: z.infer<typeof pollSchema>;
}) {
  const payload = pollSchema.parse(input);
  const optionsJson = payload.options.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.label;
    return acc;
  }, {});

  if (pollId) {
    return prisma.poll.update({
      where: { id: pollId },
      data: {
        question: payload.question,
        optionsJson,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt
      }
    });
  }

  return prisma.poll.create({
    data: {
      question: payload.question,
      optionsJson,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt
    }
  });
}

export async function getActivePoll() {
  return prisma.poll.findFirst({
    where: {
      status: "ACTIVE",
      AND: [
        {
          OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }]
        },
        {
          OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }]
        }
      ]
    },
    orderBy: { createdAt: "desc" },
    include: { votes: true }
  });
}

export async function listPolls() {
  return prisma.poll.findMany({ orderBy: { createdAt: "desc" }, include: { votes: true } });
}

export async function getPollById(id: string) {
  return prisma.poll.findUnique({ where: { id }, include: { votes: true } });
}

export async function updatePollStatus({
  pollId,
  status
}: {
  pollId: string;
  status: PollStatus;
}) {
  return prisma.poll.update({ where: { id: pollId }, data: { status } });
}

export async function deletePoll(pollId: string) {
  return prisma.poll.delete({ where: { id: pollId } });
}

export async function votePoll({
  pollId,
  optionKey,
  userId,
  ipHash
}: {
  pollId: string;
  optionKey: string;
  userId?: string;
  ipHash?: string;
}) {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) {
    throw new Error("Poll not found");
  }

  const options = poll.optionsJson as unknown as Record<string, string>;
  if (!options[optionKey]) {
    throw new Error("Invalid option");
  }

  const orConditions: Array<{ userId?: string; ipHash?: string }> = [];
  if (userId) {
    orConditions.push({ userId });
  }
  if (ipHash) {
    orConditions.push({ ipHash });
  }

  const existing = await prisma.pollVote.findFirst({
    where: {
      pollId,
      ...(orConditions.length ? { OR: orConditions } : {})
    }
  });

  if (existing) {
    throw new Error("Already voted");
  }

  return prisma.pollVote.create({
    data: {
      pollId,
      optionKey,
      userId,
      ipHash
    }
  });
}

export const volunteerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  skills: z.string().optional(),
  notes: z.string().optional()
});

export async function submitVolunteer(input: z.infer<typeof volunteerSchema>) {
  const payload = volunteerSchema.parse(input);
  return prisma.volunteer.create({ data: payload });
}

export const newsletterSchema = z.object({ email: z.string().email() });

export async function subscribeNewsletter(input: z.infer<typeof newsletterSchema>) {
  const payload = newsletterSchema.parse(input);
  return prisma.newsletterSubscriber.upsert({
    where: { email: payload.email },
    create: payload,
    update: payload
  });
}

export async function listNewsletterSubscribers() {
  return prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listVolunteers() {
  return prisma.volunteer.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateVolunteerStatus({
  volunteerId,
  status
}: {
  volunteerId: string;
  status: string;
}) {
  return prisma.volunteer.update({ where: { id: volunteerId }, data: { status } });
}
