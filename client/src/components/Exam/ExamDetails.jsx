import { useState, useEffect } from 'react';
import {
  FaClock,
  FaCalendarAlt,
  FaKey,
  FaPlay,
  FaCheckCircle,
  FaLock,
  FaHourglassHalf,
  FaBan,
  FaUsers,
  FaQuestionCircle,
  FaChartBar,
  FaUserGraduate,
  FaEnvelope,
  FaInfoCircle,
  FaShieldAlt,
  FaTrophy,
  FaChartLine,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import examService from '../../services/examService';
import submissionService from '../../services/submissionService';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../common/BackButton';

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow min-w-0">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-indigo-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function ExamDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [eligibility, setEligibility] = useState({ canTake: false, reason: '', status: 'unknown' });
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const storedExamId = localStorage.getItem('selectedExamId');
        if (!storedExamId) { setLoading(false); return; }

        const examData = await examService.getExamById(storedExamId);

        const creatorId = examData.createdBy?._id || examData.createdBy;
        const currentUserId = user?._id || user?.id;
        const creator =
          creatorId &&
          currentUserId &&
          creatorId.toString() === currentUserId.toString();
        setIsCreator(creator);

        // Fetch submission only for non-creators
        let submission = null;
        if (!creator && user?._id) {
          try {
            submission = await submissionService.getUserSubmission(storedExamId, user._id);
          } catch {
            submission = null;
          }
        }

        // Fetch questions for creator
        if (creator) {
          try {
            const qs = await examService.getQuestions(storedExamId);
            setExamQuestions(Array.isArray(qs) ? qs : []);
          } catch {
            setExamQuestions([]);
          }
        }

        const start = new Date(examData.startDate);
        const end = new Date(start.getTime() + (examData.timeLimitMinutes || 0) * 60000);
        const now = new Date();
        const isCompleted = !!submission || now > end;
        const timeStatus = isCompleted ? 'completed' : now < start ? 'upcoming' : 'ongoing';

        setExam({
          id: examData._id,
          title: examData.title,
          description: examData.description,
          accessCode: examData.accessCode,
          publishStatus: examData.status,
          timeStatus,
          schedule: examData.startDate,
          endTime: end,
          timeLimit: examData.timeLimitMinutes,
          authorizedEmails: examData.authorizedEmails || [],
          instructions: '• You must complete the exam within the time limit\n• No pausing the timer\n• Do not refresh the page during the exam',
          passingScore: 50,
          score: submission ? submission.percentage : undefined,
        });
      } catch (err) {
        console.error('Failed to load exam details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [user]);

  useEffect(() => {
    if (!exam || isCreator) return;
    checkEligibility();
  }, [exam, currentTime, isCreator]);

  const checkEligibility = () => {
    const now = new Date();
    const startTime = new Date(exam.schedule);
    const endTime = new Date(exam.endTime);

    if (exam.publishStatus !== 'published') {
      setEligibility({ canTake: false, reason: 'This exam is not published yet.', status: 'unpublished' });
      return;
    }
    if (exam.timeStatus === 'completed') {
      setEligibility({ canTake: false, reason: 'You have already completed this exam.', status: 'completed' });
      return;
    }
    if (now < startTime) {
      const diff = startTime - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setEligibility({
        canTake: false,
        reason: `Exam has not started yet. Starts in ${h}h ${m}m`,
        status: 'upcoming',
      });
      return;
    }
    if (now > endTime) {
      setEligibility({ canTake: false, reason: 'Exam is closed.', status: 'expired' });
      return;
    }
    const minutesLeft = Math.floor((endTime - now) / 60000);
    setEligibility({ canTake: true, reason: `${minutesLeft} minutes remaining`, status: 'available' });
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatTimeLimit = (minutes) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${minutes}m`;
  };

  const handleStartExam = () => {
    if (eligibility.canTake) navigate(`/kingohub/exam?examId=${exam.id}`);
  };

  const statusConfig = {
    upcoming:    { cls: 'bg-amber-100 text-amber-800 border-amber-200',     label: 'Upcoming',          Icon: FaHourglassHalf },
    available:   { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Live Now',          Icon: FaPlay },
    completed:   { cls: 'bg-indigo-100 text-indigo-800 border-indigo-200',  label: 'Completed',         Icon: FaCheckCircle },
    expired:     { cls: 'bg-red-100 text-red-800 border-red-200',           label: 'Closed',            Icon: FaBan },
    unpublished: { cls: 'bg-gray-100 text-gray-600 border-gray-200',        label: 'Not Published',     Icon: FaLock },
    unknown:     { cls: 'bg-gray-100 text-gray-500 border-gray-200',        label: 'Loading...',        Icon: FaHourglassHalf },
  };

  const StatusBadge = ({ status }) => {
    const c = statusConfig[status] || statusConfig.unknown;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${c.cls}`}>
        <c.Icon className="w-3 h-3" /> {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6 flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaInfoCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Exam not found.</p>
        </div>
      </div>
    );
  }

  const totalPoints = examQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
  const publishStatusConfig = exam.publishStatus === 'published'
    ? { cls: 'bg-emerald-100 text-emerald-800', label: 'Published' }
    : { cls: 'bg-amber-100 text-amber-800', label: 'Draft' };

  // ─────────────────────────────────────────────────────────────
  //  CREATOR VIEW
  // ─────────────────────────────────────────────────────────────
  if (isCreator) {
    return (
      <div className="p-4 md:p-6 flex-1 bg-gray-50 min-h-screen">
        {/* Back */}
        <BackButton
          label="Back to Exams"
          className="flex items-center text-gray-500 hover:text-gray-800 mb-5 transition-colors text-sm font-medium"
        />

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-xl p-6 md:p-8 mb-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${publishStatusConfig.cls}`}>
                {publishStatusConfig.label}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                Creator View
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{exam.title}</h1>
            {exam.description && (
              <p className="text-indigo-200 text-sm leading-relaxed max-w-2xl">{exam.description}</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={FaQuestionCircle}
            label="Questions"
            value={examQuestions.length}
            colorClass="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            icon={FaChartBar}
            label="Total Marks"
            value={totalPoints}
            colorClass="bg-purple-50 text-purple-600"
          />
          <StatCard
            icon={FaUsers}
            label="Students"
            value={exam.authorizedEmails.length}
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatCard
            icon={FaClock}
            label="Duration"
            value={formatTimeLimit(exam.timeLimit)}
            colorClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam Details Card */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-indigo-500" /> Exam Details
              </h2>
              <div className="divide-y divide-gray-50">
                <InfoRow icon={FaKey} label="Access Code" value={exam.accessCode} />
                <InfoRow icon={FaCalendarAlt} label="Start Date" value={formatDate(exam.schedule)} />
                <InfoRow icon={FaClock} label="Start Time" value={formatTime(exam.schedule)} />
                <InfoRow icon={FaClock} label="End Time" value={formatTime(exam.endTime)} />
                <InfoRow icon={FaClock} label="Duration" value={formatTimeLimit(exam.timeLimit)} />
                <InfoRow icon={FaShieldAlt} label="Status" value={exam.publishStatus === 'published' ? 'Published' : 'Draft'} />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-amber-500" /> Exam Instructions
              </h2>
              <ul className="space-y-2">
                {exam.instructions.split('\n').map((line, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                    {line.replace('• ', '')}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Registration Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUserGraduate className="text-blue-500" /> Registration
              </h2>
              <div className="text-center py-2">
                <p className="text-4xl font-bold text-blue-600">{exam.authorizedEmails.length}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Students Assigned</p>
              </div>
              {exam.authorizedEmails.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto space-y-1.5">
                  {exam.authorizedEmails.map((email, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      <FaEnvelope className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exam Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartBar className="text-purple-500" /> Exam Status
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Publication</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${publishStatusConfig.cls}`}>
                    {publishStatusConfig.label}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Time Status</span>
                  <StatusBadge status={exam.timeStatus === 'upcoming' ? 'upcoming' : exam.timeStatus === 'ongoing' ? 'available' : 'completed'} />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Schedule</span>
                  <span className="text-gray-700 font-medium text-xs">{formatDate(exam.schedule)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  STUDENT VIEW
  // ─────────────────────────────────────────────────────────────
  const eConf = statusConfig[eligibility.status] || statusConfig.unknown;

  return (
    <div className="p-4 md:p-6 flex-1 bg-gray-50 min-h-screen">
      {/* Back */}
      <BackButton
        label="Back to Exams"
        className="flex items-center text-gray-500 hover:text-gray-800 mb-5 transition-colors text-sm font-medium"
      />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-xl p-6 md:p-8 mb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={eligibility.status} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{exam.title}</h1>
            {exam.description && (
              <p className="text-indigo-200 text-sm leading-relaxed max-w-2xl">{exam.description}</p>
            )}
          </div>
          {/* Quick Info */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-white">
              <FaClock className="text-indigo-200" />
              <span>{formatTimeLimit(exam.timeLimit)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-white">
              <FaCalendarAlt className="text-indigo-200" />
              <span>{formatTime(exam.schedule)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">

          {/* Eligibility Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Exam Status</h2>
              <StatusBadge status={eligibility.status} />
            </div>

            {eligibility.status === 'available' && (
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <FaCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-800">You are eligible to take this exam</p>
                  <p className="text-sm text-emerald-600 mt-0.5">{eligibility.reason}</p>
                </div>
              </div>
            )}
            {eligibility.status === 'upcoming' && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <FaHourglassHalf className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">Exam has not started yet</p>
                  <p className="text-sm text-amber-700 mt-0.5">{eligibility.reason}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Available from: {formatDate(exam.schedule)} at {formatTime(exam.schedule)}
                  </p>
                </div>
              </div>
            )}
            {eligibility.status === 'expired' && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <FaBan className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Exam is closed</p>
                  <p className="text-sm text-red-600 mt-0.5">The exam window has ended. No further attempts allowed.</p>
                </div>
              </div>
            )}
            {eligibility.status === 'completed' && (
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <FaCheckCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-700">Exam already completed</p>
                  <p className="text-sm text-gray-500 mt-0.5">You have already submitted this exam.</p>
                </div>
              </div>
            )}
            {eligibility.status === 'unpublished' && (
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <FaLock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-600">Exam is not published yet</p>
                  <p className="text-sm text-gray-500 mt-0.5">This exam is not yet available for candidates.</p>
                </div>
              </div>
            )}
          </div>

          {/* Exam Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-indigo-500" /> Exam Information
            </h2>
            <div className="divide-y divide-gray-50">
              <InfoRow icon={FaKey} label="Access Code" value={exam.accessCode} />
              <InfoRow icon={FaCalendarAlt} label="Date" value={formatDate(exam.schedule)} />
              <InfoRow icon={FaClock} label="Start Time" value={formatTime(exam.schedule)} />
              <InfoRow icon={FaClock} label="End Time" value={formatTime(exam.endTime)} />
              <InfoRow icon={FaClock} label="Duration" value={formatTimeLimit(exam.timeLimit)} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{exam.description}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-amber-500" /> Important Instructions
            </h2>
            <ul className="space-y-2.5">
              {exam.instructions.split('\n').map((line, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600">{line.replace('• ', '')}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaPlay className="text-indigo-500" /> Start Exam
            </h2>

            {eligibility.status === 'available' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                  <FaHourglassHalf className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-semibold text-emerald-800 text-sm">{eligibility.reason}</p>
                </div>
                <button
                  onClick={handleStartExam}
                  className="w-full flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-semibold shadow-sm hover:shadow-md"
                >
                  <FaPlay className="w-4 h-4 mr-2" />
                  Start Exam Now
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Ensure a stable internet connection before starting.
                </p>
              </div>
            )}

            {eligibility.status === 'upcoming' && (
              <div className="space-y-3">
                <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                  <FaHourglassHalf className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-semibold text-amber-800 text-sm">Exam Not Started Yet</p>
                </div>
                <button disabled className="w-full flex items-center justify-center px-6 py-3.5 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed font-semibold">
                  <FaLock className="w-4 h-4 mr-2" /> Locked
                </button>
              </div>
            )}

            {eligibility.status === 'completed' && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <FaCheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-600 text-sm">Exam Completed</p>
                </div>
                <button disabled className="w-full flex items-center justify-center px-6 py-3.5 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed font-semibold">
                  <FaLock className="w-4 h-4 mr-2" /> Completed
                </button>
              </div>
            )}

            {eligibility.status === 'expired' && (
              <div className="space-y-3">
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                  <FaBan className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="font-semibold text-red-700 text-sm">Exam Expired</p>
                </div>
                <button disabled className="w-full flex items-center justify-center px-6 py-3.5 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed font-semibold">
                  <FaLock className="w-4 h-4 mr-2" /> Expired
                </button>
              </div>
            )}

            {eligibility.status === 'unpublished' && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <FaLock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-500 text-sm">Not Yet Published</p>
                </div>
                <button disabled className="w-full flex items-center justify-center px-6 py-3.5 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed font-semibold">
                  <FaLock className="w-4 h-4 mr-2" /> Unavailable
                </button>
              </div>
            )}
          </div>

          {/* Score Card (completed exams) */}
          {eligibility.status === 'completed' && exam.score !== undefined && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaTrophy className="text-amber-500" /> Your Score
              </h2>
              <div className="text-center">
                <div className="relative inline-block">
                  <svg className="w-32 h-32" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke={exam.score >= exam.passingScore ? '#10b981' : '#ef4444'}
                      strokeWidth="8" fill="none"
                      strokeDasharray={`${(exam.score / 100) * 352} 352`}
                      strokeLinecap="round" transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{exam.score}%</span>
                  </div>
                </div>
                <p className={`mt-3 font-semibold text-sm ${exam.score >= exam.passingScore ? 'text-emerald-600' : 'text-red-600'}`}>
                  {exam.score >= exam.passingScore ? '🎉 Passed!' : 'Not Passed'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Passing score: {exam.passingScore}%</p>
                <button className="mt-4 w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium">
                  <FaChartLine className="w-4 h-4 mr-2" />
                  View Results
                </button>
              </div>
            </div>
          )}

          {/* Access Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-gray-400" /> Access Notes
            </h2>
            <ul className="space-y-3">
              {[
                'Access code required to start the exam',
                'Timer cannot be paused once started',
                'Ensure stable internet throughout',
              ].map((note, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-xs text-gray-500">{note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
