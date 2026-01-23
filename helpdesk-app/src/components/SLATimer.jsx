import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function SLATimer({ priority, createdDate, status }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isBreached, setIsBreached] = useState(false);

  // SLA Rules (in hours)
  const slaRules = {
    "Low": 48,
    "Medium": 24,
    "High": 4,
    "Critical": 1
  };

  useEffect(() => {
    if (status === "Closed") return; // Stop timer if closed

    const calculateTimeLeft = () => {
      const created = new Date(createdDate).getTime();
      const now = new Date().getTime();
      const limitHours = slaRules[priority] || 24;
      const limitMs = limitHours * 60 * 60 * 1000;
      const deadline = created + limitMs;
      const diff = deadline - now;

      if (diff <= 0) {
        setIsBreached(true);
        setTimeLeft("00h 00m");
      } else {
        setIsBreached(false);
        const hours = Math.floor((diff / (1000 * 60 * 60)));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [createdDate, priority, status]);

  // RENDER LOGIC
  if (status === "Closed") {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-100">
        <CheckCircle size={16} /> Resolved within SLA
      </div>
    );
  }

  if (isBreached) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-100 animate-pulse">
        <AlertTriangle size={16} /> SLA BREACHED
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 font-bold text-sm px-3 py-2 rounded-lg border ${
      parseInt(timeLeft) < 2 ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
    }`}>
      <Clock size={16} /> 
      <span>{timeLeft} remaining</span>
    </div>
  );
}