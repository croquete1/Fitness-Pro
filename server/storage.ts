import {
  users,
  clients,
  goals,
  workoutPlans,
  workoutAssignments,
  messages,
  scheduleEvents,
  progressEntries,
  type User,
  type InsertUser,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Goal,
  type InsertGoal,
  type WorkoutPlan,
  type InsertWorkoutPlan,
  type WorkoutAssignment,
  type InsertWorkoutAssignment,
  type Message,
  type InsertMessage,
  type ScheduleEvent,
  type InsertScheduleEvent,
  type ProgressEntry,
  type InsertProgressEntry,
  type GoalWithClient,
  type WorkoutPlanWithAssignments,
  type MessageWithSender,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users (for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClientsByTrainer(trainerId: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Goals
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByClient(clientId: number): Promise<Goal[]>;
  getGoalsByTrainer(trainerId: string): Promise<GoalWithClient[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;
  
  // Workout Plans
  getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined>;
  getWorkoutPlansByTrainer(trainerId: string): Promise<WorkoutPlanWithAssignments[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  
  // Workout Assignments
  assignWorkoutToClient(assignment: InsertWorkoutAssignment): Promise<WorkoutAssignment>;
  getWorkoutAssignmentsByClient(clientId: number): Promise<WorkoutAssignment[]>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<MessageWithSender[]>;
  getRecentMessagesForUser(userId: string): Promise<MessageWithSender[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Schedule Events
  getScheduleEvent(id: number): Promise<ScheduleEvent | undefined>;
  getScheduleEventsByTrainer(trainerId: string, date?: Date): Promise<ScheduleEvent[]>;
  createScheduleEvent(event: InsertScheduleEvent): Promise<ScheduleEvent>;
  
  // Progress Entries
  getProgressEntriesByGoal(goalId: number): Promise<ProgressEntry[]>;
  createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;
  
  // Dashboard Stats
  getDashboardStats(trainerId: string): Promise<{
    activeClients: number;
    goalsAchieved: number;
    sessionsToday: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientsByTrainer(trainerId: string): Promise<Client[]> {
    return await db.select().from(clients).where(eq(clients.trainerId, trainerId));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  // Goal operations
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async getGoalsByClient(clientId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.clientId, clientId));
  }

  async getGoalsByTrainer(trainerId: string): Promise<GoalWithClient[]> {
    const result = await db
      .select({
        goal: goals,
        user: users,
      })
      .from(goals)
      .innerJoin(clients, eq(goals.clientId, clients.id))
      .innerJoin(users, eq(clients.userId, users.id))
      .where(eq(goals.trainerId, trainerId));

    return result.map(({ goal, user }) => ({
      ...goal,
      clientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
      clientAvatar: user.profileImageUrl || undefined,
    }));
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  // Workout plan operations
  async getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined> {
    const [plan] = await db.select().from(workoutPlans).where(eq(workoutPlans.id, id));
    return plan || undefined;
  }

  async getWorkoutPlansByTrainer(trainerId: string): Promise<WorkoutPlanWithAssignments[]> {
    const plans = await db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.trainerId, trainerId));

    const plansWithAssignments = await Promise.all(
      plans.map(async (plan) => {
        const assignments = await db
          .select({
            client: clients,
            user: users,
          })
          .from(workoutAssignments)
          .innerJoin(clients, eq(workoutAssignments.clientId, clients.id))
          .innerJoin(users, eq(clients.userId, users.id))
          .where(eq(workoutAssignments.workoutPlanId, plan.id));

        return {
          ...plan,
          assignedClientCount: assignments.length,
          assignedClients: assignments.map(({ user }) => ({
            id: parseInt(user.id),
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
            avatar: user.profileImageUrl || undefined,
          })),
        };
      })
    );

    return plansWithAssignments;
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const [plan] = await db.insert(workoutPlans).values({
      ...insertPlan,
      exercises: insertPlan.exercises || [],
    }).returning();
    return plan;
  }

  // Workout assignment operations
  async assignWorkoutToClient(insertAssignment: InsertWorkoutAssignment): Promise<WorkoutAssignment> {
    const [assignment] = await db.insert(workoutAssignments).values(insertAssignment).returning();
    return assignment;
  }

  async getWorkoutAssignmentsByClient(clientId: number): Promise<WorkoutAssignment[]> {
    return await db
      .select()
      .from(workoutAssignments)
      .where(eq(workoutAssignments.clientId, clientId));
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<MessageWithSender[]> {
    const result = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(desc(messages.createdAt));

    return result.map(({ message, sender }) => ({
      ...message,
      senderName: `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || sender.email || 'Unknown',
      senderAvatar: sender.profileImageUrl || undefined,
    }));
  }

  async getRecentMessagesForUser(userId: string): Promise<MessageWithSender[]> {
    const result = await db
      .select({
        message: messages,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt))
      .limit(50);

    return result.map(({ message, sender }) => ({
      ...message,
      senderName: `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || sender.email || 'Unknown',
      senderAvatar: sender.profileImageUrl || undefined,
    }));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  // Schedule event operations
  async getScheduleEvent(id: number): Promise<ScheduleEvent | undefined> {
    const [event] = await db.select().from(scheduleEvents).where(eq(scheduleEvents.id, id));
    return event || undefined;
  }

  async getScheduleEventsByTrainer(trainerId: string, date?: Date): Promise<ScheduleEvent[]> {
    let query = db.select().from(scheduleEvents).where(eq(scheduleEvents.trainerId, trainerId));

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query.where(
        and(
          eq(scheduleEvents.trainerId, trainerId),
          sql`${scheduleEvents.startTime} >= ${startOfDay}`,
          sql`${scheduleEvents.startTime} <= ${endOfDay}`
        )
      );
    }

    return await query;
  }

  async createScheduleEvent(insertEvent: InsertScheduleEvent): Promise<ScheduleEvent> {
    const [event] = await db.insert(scheduleEvents).values(insertEvent).returning();
    return event;
  }

  // Progress entry operations
  async getProgressEntriesByGoal(goalId: number): Promise<ProgressEntry[]> {
    return await db
      .select()
      .from(progressEntries)
      .where(eq(progressEntries.goalId, goalId))
      .orderBy(desc(progressEntries.recordedAt));
  }

  async createProgressEntry(insertEntry: InsertProgressEntry): Promise<ProgressEntry> {
    const [entry] = await db.insert(progressEntries).values(insertEntry).returning();
    return entry;
  }

  // Dashboard stats
  async getDashboardStats(trainerId: string): Promise<{
    activeClients: number;
    goalsAchieved: number;
    sessionsToday: number;
    successRate: number;
  }> {
    const [activeClientsResult] = await db
      .select({ count: count() })
      .from(clients)
      .where(and(eq(clients.trainerId, trainerId), eq(clients.isActive, true)));

    const [completedGoalsResult] = await db
      .select({ count: count() })
      .from(goals)
      .where(and(eq(goals.trainerId, trainerId), eq(goals.status, 'completed')));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todaySessionsResult] = await db
      .select({ count: count() })
      .from(scheduleEvents)
      .where(
        and(
          eq(scheduleEvents.trainerId, trainerId),
          sql`${scheduleEvents.startTime} >= ${today}`,
          sql`${scheduleEvents.startTime} < ${tomorrow}`
        )
      );

    const [totalGoalsResult] = await db
      .select({ count: count() })
      .from(goals)
      .where(eq(goals.trainerId, trainerId));

    const totalGoals = totalGoalsResult.count;
    const completedGoals = completedGoalsResult.count;
    const successRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    return {
      activeClients: activeClientsResult.count,
      goalsAchieved: completedGoals,
      sessionsToday: todaySessionsResult.count,
      successRate,
    };
  }
}

export const storage = new DatabaseStorage();