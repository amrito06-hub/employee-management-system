import React, { useEffect, useMemo, useState, useCallback } from "react";
import API from "../services/api";
import {
  Calendar,
  CalendarDays,
  Check,
  X,
  Clock,
  LogIn,
  LogOut,
  Loader2,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_OPTIONS = ["Present", "Absent", "Half Day", "Leave", "Holiday"];

const STATUS_STYLES = {
  Present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Absent: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  "Half Day": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Leave: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  Holiday: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  "Not Marked": "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400",
};

const todayISO = () => new Date().toISOString().split("T")[0];

const formatTime = (value) => {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Attendance() {
  const [view, setView] = useState("daily"); // "daily" | "monthly"

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Attendance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mark daily attendance or review monthly records.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 self-start">
          <button
            onClick={() => setView("daily")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              view === "daily"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Calendar size={16} />
            Daily Sheet
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              view === "monthly"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <CalendarDays size={16} />
            Monthly View
          </button>
        </div>
      </div>

      {view === "daily" ? <DailySheet /> : <MonthlyView />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Daily Sheet                                                         */
/* ------------------------------------------------------------------ */

function DailySheet() {
  const [date, setDate] = useState(todayISO());
  const [sheet, setSheet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState({}); // { employeeId: status }
  const [selfEmployeeId, setSelfEmployeeId] = useState("");
  const [selfLoading, setSelfLoading] = useState(false);

  const fetchSheet = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/attendance/daily", {
        params: { date },
      });
      setSheet(res.data.sheet || []);
      setDirty({});
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not load attendance for this date"
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  const handleStatusChange = (employeeId, status) => {
    setDirty((prev) => ({
      ...prev,
      [employeeId]: status,
    }));
    setSheet((prev) =>
      prev.map((row) =>
        row.employee === employeeId
          ? {
              ...row,
              status,
            }
          : row
      )
    );
  };

  const handleSave = async () => {
    const records = Object.entries(dirty).map(([employee, status]) => ({
      employee,
      status,
    }));
    if (records.length === 0) return;

    setSaving(true);
    setError("");
    try {
      await API.post("/attendance/bulk-mark", { date, records });
      await fetchSheet();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selfEmployeeId) return;
    setSelfLoading(true);
    setError("");
    try {
      await API.post("/attendance/check-in", {
        employee: selfEmployeeId,
      });
      await fetchSheet();
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    } finally {
      setSelfLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selfEmployeeId) return;
    setSelfLoading(true);
    setError("");
    try {
      await API.post("/attendance/check-out", {
        employee: selfEmployeeId,
      });
      await fetchSheet();
    } catch (err) {
      setError(err.response?.data?.message || "Check-out failed");
    } finally {
      setSelfLoading(false);
    }
  };

  const dirtyCount = Object.keys(dirty).length;
  const isToday = date === todayISO();

  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, "Half Day": 0, Leave: 0, Holiday: 0, "Not Marked": 0 };
    sheet.forEach((row) => {
      if (counts[row.status] !== undefined) counts[row.status]++;
    });
    return counts;
  }, [sheet]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm"
        />

        {isToday && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <select
              value={selfEmployeeId}
              onChange={(e) => setSelfEmployeeId(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select employee for check-in/out</option>
              {sheet.map((row) => (
                <option key={row.employee} value={row.employee}>
                  {row.employeeId} — {row.fullName}
                </option>
              ))}
            </select>
            <button
              onClick={handleCheckIn}
              disabled={!selfEmployeeId || selfLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selfLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!selfEmployeeId || selfLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selfLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              Check Out
            </button>
          </div>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {Object.entries(summary).map(([status, count]) => (
          <div
            key={status}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-center"
          >
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{count}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{status}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm px-4 py-2">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/40 text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Emp ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Department</th>
                <th className="px-4 py-3 font-medium">Check In</th>
                <th className="px-4 py-3 font-medium">Check Out</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full max-w-[100px] rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sheet.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No employees found.
                  </td>
                </tr>
              ) : (
                sheet.map((row) => (
                  <tr
                    key={row.employee}
                    className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                  >
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 font-mono text-xs">
                      {row.employeeId}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{row.fullName}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {row.department}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} /> {formatTime(row.checkIn)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} /> {formatTime(row.checkOut)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status}
                        onChange={(e) => handleStatusChange(row.employee, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 outline-none cursor-pointer ${STATUS_STYLES[row.status]}`}
                      >
                        <option value="Not Marked" disabled>
                          Not Marked
                        </option>
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save bar */}
      {dirtyCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-full shadow-lg text-sm">
          <span>{dirtyCount} change{dirtyCount > 1 ? "s" : ""} pending</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Monthly View                                                        */
/* ------------------------------------------------------------------ */

function MonthlyView() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/employees")
      .then((res) => {
        const list = res.data.employees || [];
        setEmployees(list);
        if (list.length > 0) setEmployeeId(list[0]._id);
      })
      .catch(() => setError("Could not load employee list"));
  }, []);

  const fetchMonth = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/attendance/monthly", {
        params: { employee: employeeId, month, year },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load monthly attendance");
    } finally {
      setLoading(false);
    }
  }, [employeeId, month, year]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m);
    setYear(y);
  };

  const recordsByDay = useMemo(() => {
    const map = {};
    (data?.records || []).forEach((r) => {
      const day = new Date(r.date).getDate();
      map[day] = r;
    });
    return map;
  }, [data]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOffset = new Date(year, month - 1, 1).getDay();
  const monthLabel = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm"
        >
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.employeeId} — {emp.fullName}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-36 text-center">
            {monthLabel}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm px-4 py-2">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {data?.summary && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
          {Object.entries(data.summary).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-center"
            >
              <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">{count}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{status}</div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="animate-spin mr-2" size={18} /> Loading...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-medium text-slate-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const record = recordsByDay[day];
                const status = record?.status;
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs border ${
                      status
                        ? STATUS_STYLES[status] + " border-transparent"
                        : "border-slate-100 dark:border-slate-700 text-slate-400"
                    }`}
                    title={status || "No record"}
                  >
                    <span className="font-medium">{day}</span>
                    {status && <Check size={11} className="mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {STATUS_OPTIONS.map((status) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_STYLES[status].split(" ")[0]}`} />
            {status}
          </div>
        ))}
      </div>
    </div>
  );
}
