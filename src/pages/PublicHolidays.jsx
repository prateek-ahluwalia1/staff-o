import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSubmit from '../hooks/useSubmit';
import '../assets/css/PublicHolidays.css';

const PUBLIC_HOLIDAY_ENDPOINTS = {
    list: 'api/admin/get-public-holiday',
    save: 'api/admin/add-public-holiday',
    update: 'api/admin/update-public-holiday',
    delete: 'api/admin/delete-public-holiday',
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

const getMonthLabel = (date) => date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });

const parseHolidayDate = (value) => {
    if (!value) return null;

    if (/^\d{8}$/.test(value)) {
        const year = Number(value.slice(0, 4));
        const month = Number(value.slice(4, 6)) - 1;
        const day = Number(value.slice(6, 8));
        return new Date(year, month, day);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toInputDate = (value) => {
    const parsed = parseHolidayDate(value);
    if (!parsed) return '';

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

const PublicHolidays = () => {
    const { submit: submitHolidayList, loading: listLoading } = useSubmit({ isAuth: true });
    const { submit: submitHolidayMutation, loading: mutationLoading } = useSubmit({ isAuth: true });
    const [selectedState, setSelectedState] = useState('vic');
    const [holidays, setHolidays] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        holiday_name: '',
        date: '',
        holiday_information: '',
        state: 'vic',
    });

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

    const monthHolidayCount = useMemo(() => {
        return holidays.filter((holiday) => {
            const date = parseHolidayDate(holiday?.date);
            return (
                date &&
                date.getMonth() === currentMonth.getMonth() &&
                date.getFullYear() === currentMonth.getFullYear()
            );
        }).length;
    }, [currentMonth, holidays]);

    const holidaysByDayKey = useMemo(() => {
        return holidays.reduce((accumulator, holiday) => {
            const date = parseHolidayDate(holiday?.date);
            if (!date) return accumulator;
            accumulator[getDayKey(date)] = holiday;
            return accumulator;
        }, {});
    }, [holidays]);

    const getHolidayForDate = (date) => holidaysByDayKey[getDayKey(date)];

    const handleDateClick = (date) => {
        const holiday = getHolidayForDate(date);

        if (holiday) {
            setIsEditMode(true);
            setEditingId(holiday.id);
            setFormData({
                holiday_name: holiday.holiday_name || '',
                date: toInputDate(holiday.date),
                holiday_information: holiday.information || holiday.holiday_information || '',
                state: holiday.state || selectedState,
            });
        } else {
            setIsEditMode(false);
            setEditingId(null);
            setFormData({
                holiday_name: '',
                date: toInputDate(date),
                holiday_information: '',
                state: selectedState,
            });
        }

        setShowModal(true);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            holiday_name: formData.holiday_name,
            date: formData.date,
            holiday_information: formData.holiday_information,
            state: formData.state,
        };

        if (isEditMode) {
            payload.id = editingId;
        }

        const endpoint = isEditMode ? PUBLIC_HOLIDAY_ENDPOINTS.update : PUBLIC_HOLIDAY_ENDPOINTS.save;

        const response = await submitHolidayMutation(endpoint, payload, {
            method: 'POST',
        });

        if (response?.success === false) return;

        await fetchHolidays();
        setShowModal(false);
        setEditingId(null);
        setIsEditMode(false);
        setFormData({
            holiday_name: '',
            date: '',
            holiday_information: '',
            state: selectedState,
        });
        toast.success(isEditMode ? 'Holiday updated.' : 'Holiday added.');
    };

    const handleDelete = async () => {
        if (!editingId) return;
        if (!window.confirm('Are you sure you want to delete this holiday?')) return;

        const response = await submitHolidayMutation(
            PUBLIC_HOLIDAY_ENDPOINTS.delete,
            { id: editingId },
            { method: 'POST' },
        );

        if (response?.success === false) return;

        await fetchHolidays();
        setShowModal(false);
        setEditingId(null);
        setIsEditMode(false);
        toast.success('Holiday deleted.');
    };

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

        for (let index = 0; index < firstDay; index += 1) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
        }

        return days;
    };

    const calendarDays = generateCalendarDays();
    const monthLabel = getMonthLabel(currentMonth);
    const isBusy = listLoading || mutationLoading;

    return (
        <div className="dashboard-main dashboard-tools-page public-holidays-page staffoo-page">
            <div className="card border-0 shadow-sm mb-3 mb-md-4 holiday-top-card">
                <div className="card-body p-3 p-md-4">
                    <div className="holiday-topbar">
                        <div className="holiday-topbar-copy">
                            <h2 className="h4 m-0 text-dark fw-bold">Public Holidays</h2>
                            <p className="mb-0 text-muted small">
                                Manage state holidays in a calendar view for {selectedStateLabel}.
                            </p>
                        </div>
                        <div className="holiday-topbar-controls">
                            <div className="holiday-state-picker">
                                <label className="form-label text-muted small fw-bold text-uppercase mb-1">
                                    State
                                </label>
                                <select
                                    className="form-select clean-input"
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                >
                                    {AUSTRALIAN_STATES.map((state) => (
                                        <option key={state.code} value={state.code}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="holiday-month-pill">
                                <span className="text-muted small d-block">Current month</span>
                                <strong>{monthLabel}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-3 mb-md-4">
                <div className="card-body p-2 p-md-4 holiday-calendar-card">
                    <div className="calendar-header">
                        <button className="calendar-nav-btn" onClick={previousMonth} type="button">
                            <i className="fa fa-chevron-left"></i>
                        </button>
                        <div className="text-center">
                            <h3 className="calendar-month mb-1">{monthLabel}</h3>
                            <div className="text-muted small">Click a day to add or edit a holiday</div>
                        </div>
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

                    <div className="calendar-meta-row">
                        <div className="calendar-meta-chip">
                            <strong>{monthHolidayCount}</strong>
                            <span>Visible holidays</span>
                        </div>
                        <div className="calendar-meta-chip">
                            <strong>{selectedStateLabel}</strong>
                            <span>Selected state</span>
                        </div>
                        <div className="calendar-meta-chip">
                            <strong>{isEditMode ? 'Yes' : 'No'}</strong>
                            <span>Editing</span>
                        </div>
                    </div>

                    <div className="calendar-days">
                        {calendarDays.map((date, index) => {
                            const holiday = date ? getHolidayForDate(date) : null;
                            const isToday = date && date.toDateString() === new Date().toDateString();
                            const isCurrentMonth = date && date.getMonth() === currentMonth.getMonth();

                            return (
                                <div
                                    key={index}
                                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${holiday ? 'has-holiday' : ''}`}
                                    onClick={() => isCurrentMonth && date && handleDateClick(date)}
                                >
                                    {date && (
                                        <>
                                            <div className="day-number">{date.getDate()}</div>
                                            {holiday && (
                                                <div className="holiday-badge">
                                                    <i className="fa fa-calendar-check"></i>
                                                    <span className="holiday-name-short">
                                                        {holiday.holiday_name.substring(0, 15)}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h3 className="holidays-list-title mb-0">Holidays for {monthLabel}</h3>
                        <span className="text-muted small">Tap any entry to edit or remove it</span>
                    </div>

                    <div className="holidays-list">
                        {isBusy ? (
                            <div className="loading-message">Loading holidays...</div>
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
                                    <div key={holiday.id} className="holiday-item">
                                        <div className="holiday-item-header">
                                            <h4 className="holiday-item-name">{holiday.holiday_name}</h4>
                                            <span className="holiday-item-date">{toInputDate(holiday.date)}</span>
                                        </div>
                                        <p className="holiday-item-info">{holiday.information || holiday.holiday_information}</p>
                                        <button
                                            className="holiday-item-edit-btn"
                                            onClick={() => handleDateClick(parseHolidayDate(holiday.date))}
                                            type="button"
                                        >
                                            Edit / Delete
                                        </button>
                                    </div>
                                ))
                        ) : (
                            <div className="no-holidays">No holidays found for this month.</div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="custom-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="custom-modal-content holiday-modal-shell" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header d-flex justify-content-between p-3 p-md-4 border-bottom">
                            <h5 className="m-0 fw-bold">
                                {isEditMode ? 'Edit Holiday' : 'Add New Holiday'}
                            </h5>
                            <button
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                                type="button"
                            ></button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-3 p-md-4">
                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Holiday Name *</label>
                                <input
                                    type="text"
                                    className="form-control clean-input"
                                    value={formData.holiday_name}
                                    onChange={(event) =>
                                        setFormData((previous) => ({
                                            ...previous,
                                            holiday_name: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Date *</label>
                                <input
                                    type="date"
                                    className="form-control clean-input"
                                    value={formData.date}
                                    onChange={(event) =>
                                        setFormData((previous) => ({
                                            ...previous,
                                            date: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-muted small fw-bold">Information *</label>
                                <textarea
                                    className="form-control clean-input"
                                    rows="4"
                                    value={formData.holiday_information}
                                    onChange={(event) =>
                                        setFormData((previous) => ({
                                            ...previous,
                                            holiday_information: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold">State *</label>
                                <select
                                    className="form-select clean-input"
                                    value={formData.state}
                                    onChange={(event) =>
                                        setFormData((previous) => ({
                                            ...previous,
                                            state: event.target.value,
                                        }))
                                    }
                                    required
                                >
                                    {AUSTRALIAN_STATES.map((state) => (
                                        <option key={state.code} value={state.code}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="d-flex flex-wrap justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light px-4 rounded-pill fw-medium"
                                    onClick={() => setShowModal(false)}
                                    disabled={mutationLoading}
                                >
                                    Cancel
                                </button>
                                {isEditMode && (
                                    <button
                                        type="button"
                                        className="btn btn-danger px-4 rounded-pill fw-medium"
                                        onClick={handleDelete}
                                        disabled={mutationLoading}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary-custom px-4 rounded-pill fw-medium"
                                    disabled={mutationLoading}
                                >
                                    {mutationLoading ? 'Saving...' : `${isEditMode ? 'Update' : 'Add'} Holiday`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicHolidays;