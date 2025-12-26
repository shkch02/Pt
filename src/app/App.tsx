import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { MemberList } from './components/MemberList';
import { ScheduleView } from './components/ScheduleView';
import { WorkoutLogView } from './components/WorkoutLogView';
import { mockMembers, mockSchedules, mockWorkoutLogs } from './data/mockData';
import { Member, Schedule, WorkoutLog } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('members');
  
  // State management (in production, this would be handled by a backend)
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(mockWorkoutLogs);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('members');
  };

  const handleAddMember = (newMember: Omit<Member, 'id'>) => {
    const member: Member = {
      ...newMember,
      id: `m-${Date.now()}`,
    };
    setMembers([...members, member]);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleAddSchedule = (newSchedule: Omit<Schedule, 'id'>) => {
    const schedule: Schedule = {
      ...newSchedule,
      id: `s-${Date.now()}`,
    };
    setSchedules([...schedules, schedule]);
  };

  const handleAddWorkoutLog = (newLog: Omit<WorkoutLog, 'id'>) => {
    const log: WorkoutLog = {
      ...newLog,
      id: `wl-${Date.now()}`,
    };
    setWorkoutLogs([...workoutLogs, log]);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      {currentPage === 'members' && (
        <MemberList
          members={members}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
        />
      )}
      {currentPage === 'schedule' && (
        <ScheduleView
          schedules={schedules}
          members={members}
          onAddSchedule={handleAddSchedule}
        />
      )}
      {currentPage === 'workout-logs' && (
        <WorkoutLogView
          workoutLogs={workoutLogs}
          members={members}
          onAddWorkoutLog={handleAddWorkoutLog}
        />
      )}
    </Layout>
  );
}
