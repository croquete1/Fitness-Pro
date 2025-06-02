import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertGoalSchema,
  insertWorkoutPlanSchema,
  insertMessageSchema,
  insertScheduleEventSchema,
  insertProgressEntrySchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  // Goals endpoints
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getGoalsByTrainer(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertGoalSchema.parse({
        ...req.body,
        trainerId: userId,
      });
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const goal = await storage.updateGoal(id, updates);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Workout plans endpoints with enhanced exercises
  app.get("/api/workout-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const plans = await storage.getWorkoutPlansByTrainer(userId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout plans" });
    }
  });

  app.post("/api/workout-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const planData = insertWorkoutPlanSchema.parse({
        ...req.body,
        trainerId: userId,
      });
      const plan = await storage.createWorkoutPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  // Messages and chat endpoints
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getRecentMessagesForUser(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.get("/api/messages/chat/:clientId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clientId = req.params.clientId;
      const messages = await storage.getMessagesBetweenUsers(userId, clientId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });
      const message = await storage.createMessage(messageData);
      
      // Broadcast message to WebSocket clients
      const messageWithSender = {
        ...message,
        senderName: req.user.claims.first_name || req.user.claims.email || 'User',
        senderAvatar: req.user.claims.profile_image_url,
      };
      
      broadcastMessage(messageWithSender);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markMessageAsRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Schedule endpoints
  app.get("/api/schedule", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const events = await storage.getScheduleEventsByTrainer(userId, date);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get schedule events" });
    }
  });

  app.post("/api/schedule", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertScheduleEventSchema.parse({
        ...req.body,
        trainerId: userId,
      });
      const event = await storage.createScheduleEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create schedule event" });
    }
  });

  // Progress entries endpoints
  app.get("/api/goals/:goalId/progress", isAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const entries = await storage.getProgressEntriesByGoal(goalId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress entries" });
    }
  });

  app.post("/api/goals/:goalId/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalId = parseInt(req.params.goalId);
      const entryData = insertProgressEntrySchema.parse({
        ...req.body,
        goalId,
        recordedBy: userId,
      });
      const entry = await storage.createProgressEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress entry" });
    }
  });

  // Clients endpoint
  app.get("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clients = await storage.getClientsByTrainer(userId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to get clients" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedClients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket client connected');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join') {
          connectedClients.set(message.userId, ws);
          console.log(`User ${message.userId} joined chat`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from connected clients
      for (const [userId, client] of connectedClients.entries()) {
        if (client === ws) {
          connectedClients.delete(userId);
          console.log(`User ${userId} disconnected from chat`);
          break;
        }
      }
    });
  });

  // Function to broadcast messages to connected clients
  function broadcastMessage(message: any) {
    const messageData = JSON.stringify({
      type: 'new_message',
      data: message
    });

    connectedClients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageData);
      }
    });
  }

  return httpServer;
}