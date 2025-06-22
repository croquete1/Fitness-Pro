import React, { useState, useEffect, Suspense, lazy, createContext, useContext } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { User, Dumbbell, BarChart3, MessageCircle, Sun, Moon, Plus, Trash2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { db } from "@/lib/firebase_config"
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore"
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
// código completo omitido para simplicidade neste exemplo
