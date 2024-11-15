"use client"

import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Types
type Priority = 'low' | 'medium' | 'high';
type Status = 'upcoming' | 'overdue' | 'completed';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  completed: boolean;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverdueAlert, setShowOverdueAlert] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check for overdue tasks
  useEffect(() => {
    const checkOverdueTasks = () => {
      const now = new Date();
      const upcomingTasks = tasks.filter(task => 
        task.status === 'upcoming' && 
        new Date(task.dueDate) < now
      );

      if (upcomingTasks.length > 0) {
        setShowOverdueAlert(true);
        // Update status of overdue tasks
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.status === 'upcoming' && new Date(task.dueDate) < now
              ? { ...task, status: 'overdue' }
              : task
          )
        );
      }
    };

    const interval = setInterval(checkOverdueTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = () => {
    if (newTask.title && newTask.dueDate && newTask.priority) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description || '',
        dueDate: newTask.dueDate,
        priority: newTask.priority as Priority,
        status: 'upcoming',
        completed: false,
      };

      setTasks([...tasks, task]);
      setNewTask({});
      setDialogOpen(false);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed, status: !task.completed ? 'completed' : 'upcoming' }
        : task
    ));
  };

  const filteredTasks = (status: Status) => {
    return tasks.filter(task => 
      task.status === status &&
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.description}</p>
            <div className="flex gap-2 mt-2">
              <span className={`px-2 py-1 rounded text-xs ${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
              <span className="text-xs text-gray-600">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleTaskComplete(task.id)}
            >
              {task.completed ? 'Undo' : 'Complete'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task Title"
                value={newTask.title || ''}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={newTask.description || ''}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              />
              <Input
                type="datetime-local"
                value={newTask.dueDate || ''}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <Select
                onValueChange={(value: Priority) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button onClick={addTask}>Add Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {showOverdueAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Some tasks are now overdue! Please check your task list.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming" className="px-4">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue" className="px-4">Overdue</TabsTrigger>
          <TabsTrigger value="completed" className="px-4">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {filteredTasks('upcoming').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="overdue">
          {filteredTasks('overdue').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="completed">
          {filteredTasks('completed').map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManager;