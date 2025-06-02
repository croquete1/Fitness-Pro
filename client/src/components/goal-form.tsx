import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "@/hooks/use-accessibility";
import { apiRequest } from "@/lib/queryClient";
import { insertGoalSchema } from "@shared/schema";

interface Client {
  id: number;
  name: string;
  avatar?: string;
}

export function GoalForm() {
  const { toast } = useToast();
  const { announceToScreenReader } = useAccessibility();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    clientId: "",
    goalType: "",
    title: "",
    description: "",
    targetValue: "",
    unit: "",
    targetDate: "",
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createGoalMutation = useMutation({
    mutationFn: (goalData: any) => apiRequest("POST", "/api/goals", goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Goal created successfully!",
      });
      announceToScreenReader("Goal created successfully");
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
      announceToScreenReader("Failed to create goal");
    },
  });

  const resetForm = () => {
    setFormData({
      clientId: "",
      goalType: "",
      title: "",
      description: "",
      targetValue: "",
      unit: "",
      targetDate: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.goalType || !formData.description || !formData.targetDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const goalData = {
        clientId: parseInt(formData.clientId),
        trainerId: 1, // Current trainer
        title: formData.title || formData.description,
        description: formData.description,
        goalType: formData.goalType,
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : null,
        unit: formData.unit || null,
        targetDate: formData.targetDate,
        currentValue: 0,
        progress: 0,
        status: "active",
      };

      // Validate with schema
      insertGoalSchema.parse(goalData);
      
      createGoalMutation.mutate(goalData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check your input data.",
        variant: "destructive",
      });
    }
  };

  const goalTypes = [
    { value: "weight-loss", label: "Weight Loss" },
    { value: "strength", label: "Strength Training" },
    { value: "endurance", label: "Endurance" },
    { value: "flexibility", label: "Flexibility" },
    { value: "custom", label: "Custom Goal" },
  ];

  return (
    <section aria-labelledby="quick-goal-heading">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle id="quick-goal-heading" className="text-lg font-semibold text-foreground">
            Quick Goal Creation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-labelledby="quick-goal-heading">
            <div>
              <Label htmlFor="client-select" className="block text-sm font-medium text-foreground mb-2">
                Select Client
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                required
              >
                <SelectTrigger id="client-select" className="w-full focus-ring">
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goal-type-select" className="block text-sm font-medium text-foreground mb-2">
                Goal Type
              </Label>
              <Select
                value={formData.goalType}
                onValueChange={(value) => setFormData({ ...formData, goalType: value })}
                required
              >
                <SelectTrigger id="goal-type-select" className="w-full focus-ring">
                  <SelectValue placeholder="Select goal type..." />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goal-title" className="block text-sm font-medium text-foreground mb-2">
                Goal Title (Optional)
              </Label>
              <Input
                id="goal-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Lose 10 pounds"
                className="focus-ring"
              />
            </div>

            <div>
              <Label htmlFor="goal-description" className="block text-sm font-medium text-foreground mb-2">
                Goal Description
              </Label>
              <Textarea
                id="goal-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the specific goal..."
                rows={3}
                className="focus-ring"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target-value" className="block text-sm font-medium text-foreground mb-2">
                  Target Value (Optional)
                </Label>
                <Input
                  id="target-value"
                  type="number"
                  step="0.1"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  placeholder="e.g., 10"
                  className="focus-ring"
                />
              </div>
              <div>
                <Label htmlFor="unit" className="block text-sm font-medium text-foreground mb-2">
                  Unit (Optional)
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., lbs, kg, minutes"
                  className="focus-ring"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target-date" className="block text-sm font-medium text-foreground mb-2">
                Target Date
              </Label>
              <Input
                id="target-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="focus-ring"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={createGoalMutation.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary-700 focus-ring font-medium"
            >
              {createGoalMutation.isPending ? "Creating Goal..." : "Create Goal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
