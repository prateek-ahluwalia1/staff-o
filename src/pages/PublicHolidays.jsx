import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSubmit from '../hooks/useSubmit';

const PUBLIC_HOLIDAY_ENDPOINTS = {
    list: 'api/admin/get-public-holiday'
};

const AUSTRALIAN_STATES = [
    { code: 'vic', name: 'Victoria' },
    { code: 'nsw', name: 'New South Wales' },
    { code: 'qld', name: 'Queensland' },
    { code: 'tas', name: 'Tasmania' },
    { code: 'wa', name: 'Western Australia' },
    { code: 'sa', name: 'South Australia' },
    { code: 'act', name: 'ACT' },
];

const getMonthLabel = (date) =>
    date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

// ---------- Date helpers ----------
const parseHolidayDate = (value) => {
    if (!value) return null;

    // Handle YYYYMMDD format from API
    if (/^\d{8}$/.test(value)) {
        const year = Number(value.slice(0, 4));
        const month = Number(value.slice(4, 6)) - 1;
        const day = Number(value.slice(6, 8));
        return new Date(year, month, day);
    }

    // Fallback for ISO or other formats
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Converts any holiday date value to DD/MM/YYYY
const formatDateDDMMYYYY = (value) => {
    const date = parseHolidayDate(value);
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
};

const getDayKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

const getHolidayCollection = (response) => {
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.holidays)) return response.holidays;
    return [];
};

// ---------- Component ----------
const PublicHolidays = () => {
    const { submit: submitHolidayList, loading: listLoading } = useSubmit({ isAuth: true });

    const [selectedState, setSelectedState] = useState('vic');
    const [holidays, setHolidays] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const selectedStateLabel = useMemo(
        () => AUSTRALIAN_STATES.find((state) => state.code === selectedState)?.name || 'State',
        [selectedState],
    );

    const fetchHolidays = useCallback(async () => {
        const response = await submitHolidayList(
            PUBLIC_HOLIDAY_ENDPOINTS.list,
            { state: selectedState },
            { method: 'POST', silentErrorToast: true },
        );

        if (response?.success === false) {
            setHolidays([]);
            toast.error(response?.error || 'Failed to load public holidays.');
            return;
        }

        setHolidays(getHolidayCollection(response));
    }, [selectedState, submitHolidayList]);

    useEffect(() => {
        fetchHolidays();
    }, [fetchHolidays]);

    const holidaysByDayKey = useMemo(() => {
        return holidays.reduce((acc, holiday) => {
            const date = parseHolidayDate(holiday?.date);
            if (!date) return acc;
            acc[getDayKey(date)] = holiday;
            return acc;
        }, {});
    }, [holidays]);

    const getHolidayForDate = (date) => holidaysByDayKey[getDayKey(date)];

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const generateCalendarDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);

        for (let i = 0; i < firstDay; i += 1) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
        }

        return days;
    };

    const calendarDays = generateCalendarDays();
    const monthLabel = getMonthLabel(currentMonth);
    const isBusy = listLoading;

    return (
        <>
            <style>{`
                :root {
                    --navy-950: #0a1930;
                    --navy-900: #0e2340;
                    --teal: #0A7C6E;
                    --teal-dark: #075e53;
                    --teal-tint: #f0fdf9;
                    --teal-border: #d1fae5;
                    --amber: #d97706;
                    --amber-tint: #fffbeb;
                    --success: #16a34a;
                    --purple: #7c3aed;
                    --sky: #0ea5e9;
                    --ink: #0f172a;
                    --slate: #1e293b;
                    --muted: #64748b;
                    --faint: #94a3b8;
                    --line: #e2e8f0;
                    --line-soft: #f1f5f9;
                    --surface: #ffffff;
                    --canvas: #f8fafc;
                }

                /* Header Card */
                .ph-header-card {
                    position: relative;
                    background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
                    border-radius: 22px;
                    padding: 28px 24px 36px;
                    overflow: hidden;
                    isolation: isolate;
                    border: none;
                }
                .ph-header-card::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
                    background-size: 22px 22px;
                    opacity: 0.35;
                    z-index: -1;
                }
                .ph-header-card::after {
                    content: "";
                    position: absolute;
                    top: -40px;
                    right: -40px;
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
                    z-index: -1;
                }
                .ph-header-title {
                    color: #fff;
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.4px;
                    margin: 0;
                }
                .ph-header-sub {
                    color: rgba(255,255,255,0.7);
                    font-size: 13px;
                    text-transform: none;
                }
                .ph-header-state-select {
                    background: rgba(255,255,255,0.12);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 12px;
                    padding: 10px 14px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    width: auto;
                    min-width: 180px;
                    outline: none;
                }
                .ph-header-state-select:focus {
                    border-color: var(--teal);
                    box-shadow: 0 0 0 3px rgba(10,124,110,0.3);
                }
                .ph-header-month-pill {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    backdrop-filter: blur(6px);
                    border-radius: 14px;
                    padding: 10px 16px;
                    color: #fff;
                }
                .ph-header-month-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: rgba(255,255,255,0.5);
                    display: block;
                }
                .ph-header-month-value {
                    font-weight: 700;
                    font-size: 16px;
                }

                /* Calendar Card */
                .calendar-card {
                    background: #fff;
                    border-radius: 20px;
                    border: 1px solid var(--line-soft);
                    box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
                }
                .calendar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .calendar-nav-btn {
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    border: 1px solid var(--line);
                    background: #fff;
                    color: var(--slate);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .calendar-nav-btn:hover {
                    background: var(--teal-tint);
                    border-color: var(--teal);
                    color: var(--teal);
                }
                .calendar-month-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--ink);
                    text-transform: capitalize;
                }
                .calendar-weekdays {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    text-align: center;
                    margin-bottom: 12px;
                }
                .weekday {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--faint);
                    text-transform: uppercase;
                    padding: 8px 0;
                }
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 6px;
                }
                .calendar-day-cell {
                    position: relative;
                    aspect-ratio: 1 / 1;
                    border-radius: 12px;
                    background: #fff;
                    border: 1px solid var(--line);          /* ← minor border on all cells */
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--slate);
                }
                .calendar-day-cell.other-month {
                    color: var(--faint);
                    opacity: 0.5;
                    pointer-events: none;
                    border-color: transparent;              /* hide border for non-current month */
                }
                .calendar-day-cell.today {
                    border-color: var(--teal);
                    background: var(--teal-tint);
                    color: var(--teal-dark);
                }
                .calendar-day-cell.has-holiday {
                    background: rgba(10,124,110,0.06);
                    border-color: var(--teal-border);
                }
                .day-number {
                    font-size: 14px;
                    font-weight: 700;
                }
                .holiday-indicator {
                    font-size: 10px;
                    color: var(--teal);
                    margin-top: 2px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 100%;
                    line-height: 1.2;
                    text-align: center;
                }

                /* Holidays List Card */
                .list-card {
                    background: #fff;
                    border-radius: 20px;
                    border: 1px solid var(--line-soft);
                    box-shadow: 0 10px 25px -8px rgba(15,23,42,0.08);
                    padding: 24px;
                }
                .list-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--ink);
                }
                .holiday-list-item {
                    padding: 16px 0;
                    border-bottom: 1px solid var(--line-soft);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                }
                .holiday-list-item:last-child {
                    border-bottom: none;
                }
                .holiday-name {
                    font-weight: 700;
                    color: var(--ink);
                    font-size: 15px;
                }
                .holiday-info {
                    color: var(--muted);
                    font-size: 13px;
                    margin-top: 4px;
                    line-height: 1.4;
                }
                .holiday-date-badge {
                    background: var(--teal-tint);
                    border: 1px solid var(--teal-border);
                    border-radius: 30px;
                    padding: 6px 14px;
                    font-weight: 700;
                    font-size: 13px;
                    color: var(--teal-dark);
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .loading-spinner {
                    text-align: center;
                    padding: 40px;
                    color: var(--muted);
                    font-size: 15px;
                }
                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--muted);
                    font-size: 15px;
                    border: 1px dashed var(--line);
                    border-radius: 16px;
                    background: #fff;
                }
            `}</style>

            <div className="container-fluid p-3 p-md-4 ph-page-container">
                {/* Header Card */}
                <div className="ph-header-card mb-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                        <div>
                            <h1 className="ph-header-title">Public Holidays</h1>
                            <p className="ph-header-sub mt-1 mb-0">
                                View public holidays for {selectedStateLabel}.
                            </p>
                        </div>
                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <select
                                className="ph-header-state-select"
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                            >
                                {AUSTRALIAN_STATES.map((state) => (
                                    <option key={state.code} value={state.code}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                            <div className="ph-header-month-pill">
                                <span className="ph-header-month-label">Current month</span>
                                <span className="ph-header-month-value">{monthLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Card */}
                <div className="calendar-card mb-4 p-3 p-md-4">
                    <div className="calendar-header">
                        <button className="calendar-nav-btn" onClick={previousMonth} type="button">
                            <i className="fa fa-chevron-left"></i>
                        </button>
                        <h3 className="calendar-month-title mb-0">{monthLabel}</h3>
                        <button className="calendar-nav-btn" onClick={nextMonth} type="button">
                            <i className="fa fa-chevron-right"></i>
                        </button>
                    </div>

                    <div className="calendar-weekdays">
                        <div className="weekday">Sun</div>
                        <div className="weekday">Mon</div>
                        <div className="weekday">Tue</div>
                        <div className="weekday">Wed</div>
                        <div className="weekday">Thu</div>
                        <div className="weekday">Fri</div>
                        <div className="weekday">Sat</div>
                    </div>

                    <div className="calendar-grid">
                        {calendarDays.map((date, index) => {
                            const holiday = date ? getHolidayForDate(date) : null;
                            const isToday = date && date.toDateString() === new Date().toDateString();
                            const isCurrentMonth = date && date.getMonth() === currentMonth.getMonth();

                            return (
                                <div
                                    key={index}
                                    className={`calendar-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${holiday ? 'has-holiday' : ''}`}
                                >
                                    {date && (
                                        <>
                                            <div className="day-number">{date.getDate()}</div>
                                            {holiday && (
                                                <div className="holiday-indicator" title={holiday.holiday_name}>
                                                    <i className="fa fa-calendar-check me-1"></i>
                                                    {holiday.holiday_name.substring(0, 10)}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Holidays List Card */}
                <div className="list-card">
                    <h3 className="list-title mb-4">Holidays for {monthLabel}</h3>
                    {isBusy ? (
                        <div className="loading-spinner">
                            <span className="spinner-border spinner-border-sm text-teal me-2" role="status" aria-hidden="true"></span>
                            Loading holidays...
                        </div>
                    ) : holidays.length > 0 ? (
                        holidays
                            .filter((holiday) => {
                                const date = parseHolidayDate(holiday?.date);
                                return (
                                    date &&
                                    date.getMonth() === currentMonth.getMonth() &&
                                    date.getFullYear() === currentMonth.getFullYear()
                                );
                            })
                            .map((holiday) => (
                                <div key={holiday.id} className="holiday-list-item">
                                    <div className="flex-grow-1">
                                        <div className="holiday-name">{holiday.holiday_name}</div>
                                        <div className="holiday-info">
                                            {holiday.information || holiday.holiday_information || 'No additional details'}
                                        </div>
                                    </div>
                                    <div className="holiday-date-badge">
                                        <i className="fa fa-calendar-day"></i>
                                        {formatDateDDMMYYYY(holiday.date)}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="empty-state">
                            <i className="fa fa-calendar-times mb-2 d-block opacity-50" style={{ fontSize: '2rem' }}></i>
                            No holidays found for this month.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PublicHolidays;