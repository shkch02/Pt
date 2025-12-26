export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  remainingSessions: number;
  totalSessions: number;
  registrationDate: string;
  notes: string;
  profileImage?: string;
}

export interface Schedule {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  reminder: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: {
    setNumber: number;
    reps: number;
    weight: number;
  }[];
  notes: string;
}

export interface WorkoutLog {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  sessionNumber: number;
  exercises: WorkoutExercise[];
  overallNotes: string;
  reminderForNext: string;
  photos: string[];
}
