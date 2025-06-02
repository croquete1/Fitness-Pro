import { pgTable, text, serial, integer, boolean, timestamp, real, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").default("trainer").notNull(), // 'trainer' or 'client'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  trainerId: varchar("trainer_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  trainerId: varchar("trainer_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  goalType: text("goal_type").notNull(), // 'weight-loss', 'strength', 'endurance', 'flexibility', 'custom'
  targetValue: real("target_value"),
  currentValue: real("current_value").default(0),
  unit: text("unit"), // 'lbs', 'kg', 'minutes', 'reps', etc.
  targetDate: timestamp("target_date").notNull(),
  status: text("status").default("active").notNull(), // 'active', 'completed', 'paused', 'cancelled'
  progress: real("progress").default(0).notNull(), // percentage 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  trainerId: varchar("trainer_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // minutes
  exerciseCount: integer("exercise_count").notNull(),
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  category: text("category").notNull(), // 'strength', 'cardio', 'flexibility', 'mixed'
  exercises: jsonb("exercises").$type<Array<{
    id: string;
    name: string;
    description: string;
    sets: number;
    reps: string;
    duration?: number;
    imageUrl?: string;
    videoUrl?: string;
    instructions: string[];
  }>>().notNull().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutAssignments = pgTable("workout_assignments", {
  id: serial("id").primaryKey(),
  workoutPlanId: integer("workout_plan_id").notNull(),
  clientId: integer("client_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("message").notNull(), // 'message', 'trainer_note'
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduleEvents = pgTable("schedule_events", {
  id: serial("id").primaryKey(),
  trainerId: varchar("trainer_id").notNull(),
  clientId: integer("client_id"),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  eventType: text("event_type").notNull(), // 'session', 'consultation', 'group_class'
  status: text("status").default("scheduled").notNull(), // 'scheduled', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const progressEntries = pgTable("progress_entries", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  value: real("value").notNull(),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  recordedBy: varchar("recorded_by").notNull(), // user_id
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutAssignmentSchema = createInsertSchema(workoutAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleEventSchema = createInsertSchema(scheduleEvents).omit({
  id: true,
  createdAt: true,
});

export const insertProgressEntrySchema = createInsertSchema(progressEntries).omit({
  id: true,
  recordedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;

export type WorkoutAssignment = typeof workoutAssignments.$inferSelect;
export type InsertWorkoutAssignment = z.infer<typeof insertWorkoutAssignmentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type ScheduleEvent = typeof scheduleEvents.$inferSelect;
export type InsertScheduleEvent = z.infer<typeof insertScheduleEventSchema>;

export type ProgressEntry = typeof progressEntries.$inferSelect;
export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;

// Extended types for UI
export type GoalWithClient = Goal & {
  clientName: string;
  clientAvatar?: string;
};

export type WorkoutPlanWithAssignments = WorkoutPlan & {
  assignedClientCount: number;
  assignedClients: Array<{ id: number; name: string; avatar?: string }>;
};

export type MessageWithSender = Message & {
  senderName: string;
  senderAvatar?: string;
};
