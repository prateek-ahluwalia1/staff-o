import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  setConversations,
  setActiveChat,
  setMessages,
  setActiveCategory,
  prependConversation,
  clearConversationUnread,
  removeMessage,
} from "../store/slices/chatSlice";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { apiURL } from "../utils/exports";
import Modal from "../components/Modal";
import Select from "react-select";
import { getProfileImageUrlFromUserdata } from "../utils/profileImage";

const CATEGORY_LABELS = {
  staff: "Staff Support & Chat",
  customers: "Client Support & Chat",
  contractors: "Resource Partner Support & Chat",
  admin: "Admin Support & Chat",
};

const DEFAULT_ADMIN = {
  id: 1,
  name: "Staffoo Admin Support",
  email: "support@staffoo.com.au",
  user_type: "admin",
  is_active: true,
};

const Avatar = ({ src, name, size = 40 }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src && !imgError) {
    return (
      <img
        src={src}
        onError={() => setImgError(true)}
        alt={name}
        width={size}
        height={size}
        className="rounded-circle"
        style={{ objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #0A7C6E, #075e53)",
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
};

const ChatRoom = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const { user, userdata, token } = useSelector((state) => state.auth);
  const { conversations, activeConversation, messages } = useSelector(
    (state) => state.chat,
  );

  const currentUser = userdata?.data || userdata || {};
  const userType =
    userdata?.user_type?.toLowerCase() ||
    userdata?.data?.user_type?.toLowerCase() ||
    "";

  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active"); // 'active' | 'inactive'
  const [affiliationFilter, setAffiliationFilter] = useState("all"); // 'all' | 'staffoo' | 'partners'
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [mobileChatActive, setMobileChatActive] = useState(false);
  const scrollRef = useRef();
  const pickerRef = useRef();

  const isMobileView = () => window.innerWidth < 768;

  const {
    data: convData,
    loading: loadingConv,
    refetch: refetchConversations,
  } = useFetch(`api/messages/conversations`, { isAuth: true });

  // Resolve user picker endpoint with high pagination limit so active and inactive users are all fetched
  const userEndpoint = useMemo(() => {
    if (userType === "admin") {
      if (category === "staff") return "api/admin/get-staff?per_page=1000&limit=1000";
      if (category === "customers") return "api/admin/get-customers?per_page=1000&limit=1000";
      if (category === "contractors") return "api/admin/get-contractors?per_page=1000&limit=1000";
    }
    return "api/admin?per_page=1000&limit=1000";
  }, [userType, category]);

  const { data: usersData, loading: loadingUsers } = useFetch(userEndpoint, {
    isAuth: true,
  });

  // Contractors list for mapping contractor ID to Resource Partner name
  const { data: contractorsResponse } = useFetch(
    userType === "admin" ? "api/admin/get-contractors?per_page=1000&limit=1000" : null,
    { isAuth: true },
  );

  // When viewing staff category, also fetch Staffoo internal staff from contractor 1
  const { data: staffooStaffResponse } = useFetch(
    userType === "admin" && category === "staff" ? "api/get-contractor-staff/1?per_page=1000&limit=1000" : null,
    { isAuth: true },
  );

  const { submit: sendMessageApi, loading: sending } = useSubmit({
    isAuth: true,
  });

  useEffect(() => {
    dispatch(setActiveCategory(category));
  }, [category, dispatch]);

  useEffect(() => {
    if (convData) {
      const list = convData?.data || convData || [];
      dispatch(setConversations(Array.isArray(list) ? list : []));
    }
  }, [convData, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowUserPicker(false);
      }
    };
    if (showUserPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserPicker]);

  // Lookup map for contractor ID -> contractor object
  const contractorsMap = useMemo(() => {
    if (!contractorsResponse) return {};
    const raw = contractorsResponse.data?.data ?? contractorsResponse.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    const map = {};
    list.forEach((c) => {
      if (c && c.id) {
        map[String(c.id)] = c;
      }
    });
    return map;
  }, [contractorsResponse]);

  // Check if a user is active or inactive
  const isUserActive = useCallback((target) => {
    if (!target) return false;
    const u = target?.data || target;

    if (u.status !== undefined && u.status !== null) {
      const st = String(u.status).toLowerCase().trim();
      if (st === "1" || st === "active" || st === "approved" || st === "verified") return true;
      if (st === "0" || st === "inactive" || st === "suspended" || st === "blocked" || st === "rejected") return false;
    }

    if (typeof u.is_active === "boolean") {
      return u.is_active;
    }
    if (u.is_active !== undefined && u.is_active !== null) {
      return ["1", 1, "true", true].includes(u.is_active);
    }
    if (u.deleted_at) {
      return false;
    }

    const nested = u.user || u.staff || u.guard;
    if (nested) {
      if (nested.status !== undefined && nested.status !== null) {
        const st = String(nested.status).toLowerCase().trim();
        if (st === "1" || st === "active" || st === "approved" || st === "verified") return true;
        if (st === "0" || st === "inactive" || st === "suspended" || st === "blocked" || st === "rejected") return false;
      }
      if (typeof nested.is_active === "boolean") {
        return nested.is_active;
      }
      if (nested.is_active !== undefined && nested.is_active !== null) {
        return ["1", 1, "true", true].includes(nested.is_active);
      }
    }

    return true;
  }, []);

  // Determine staff affiliation: Staffoo Staff vs Resource Partner
  const getStaffAffiliation = useCallback(
    (target) => {
      if (!target) return { isStaffoo: true, label: "Staffoo Staff", partnerName: null };

      const uData = target?.data || target;

      // Explicit flag
      if (
        uData.is_staffoo_staff === true ||
        uData.is_staffoo_staff === 1 ||
        uData.is_staffoo_staff === "1"
      ) {
        return { isStaffoo: true, label: "Staffoo Staff", partnerName: null };
      }

      // Check contractor ID / parent ID
      const parentId =
        uData.user_id ||
        uData.parent_id ||
        uData.contractor_id ||
        uData.staff?.user_id ||
        uData.parent_contractor?.id;

      if (parentId !== undefined && parentId !== null) {
        if (Number(parentId) === 1 || String(parentId) === "1") {
          return { isStaffoo: true, label: "Staffoo Staff", partnerName: null };
        }

        const partner = contractorsMap[String(parentId)];
        const partnerName =
          partner?.company_name ||
          partner?.name ||
          uData.parent_contractor?.company_name ||
          uData.parent_contractor?.name ||
          uData.contractor?.company_name ||
          uData.contractor?.name ||
          uData.company_name ||
          `Partner #${parentId}`;

        return {
          isStaffoo: false,
          label: partnerName,
          partnerName: partnerName,
        };
      }

      // Embedded partner objects
      const embeddedPartner = uData.parent_contractor || uData.contractor;
      if (embeddedPartner) {
        if (Number(embeddedPartner.id) === 1 || String(embeddedPartner.id) === "1") {
          return { isStaffoo: true, label: "Staffoo Staff", partnerName: null };
        }
        const partnerName =
          embeddedPartner.company_name || embeddedPartner.name || "Resource Partner";
        return {
          isStaffoo: false,
          label: partnerName,
          partnerName: partnerName,
        };
      }

      // Company name check
      if (uData.company_name && String(uData.company_name).toLowerCase().includes("staffoo")) {
        return { isStaffoo: true, label: "Staffoo Staff", partnerName: null };
      }

      if (uData.company_name && !String(uData.company_name).toLowerCase().includes("staffoo")) {
        return {
          isStaffoo: false,
          label: uData.company_name,
          partnerName: uData.company_name,
        };
      }

      return {
        isStaffoo: true,
        label: "Staffoo Staff",
        partnerName: null,
      };
    },
    [contractorsMap],
  );

  // Combine and deduplicate users from endpoints
  const allUsers = useMemo(() => {
    const extractList = (res) => {
      if (!res) return [];
      if (Array.isArray(res)) return res;
      if (Array.isArray(res.guards)) return res.guards;
      if (res.data && Array.isArray(res.data.guards)) return res.data.guards;
      if (Array.isArray(res.data)) return res.data;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    };

    const primaryList = extractList(usersData);
    const secondaryList = extractList(staffooStaffResponse);

    const list = [];
    const seen = new Set();

    primaryList.forEach((u) => {
      const uData = u?.data || u;
      if (uData?.id && !seen.has(String(uData.id))) {
        seen.add(String(uData.id));
        list.push(uData);
      }
    });

    secondaryList.forEach((u) => {
      const uData = u?.data || u;
      if (uData?.id && !seen.has(String(uData.id))) {
        seen.add(String(uData.id));
        list.push({ ...uData, user_id: 1, is_staffoo_staff: true });
      }
    });

    return list;
  }, [usersData, staffooStaffResponse]);

  // Lookup map of user id -> enriched user details
  const staffLookup = useMemo(() => {
    const map = {};
    allUsers.forEach((u) => {
      const uData = u?.data || u;
      if (uData?.id) {
        map[String(uData.id)] = uData;
      }
    });
    return map;
  }, [allUsers]);

  // Filtered users for user picker modal
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const uData = u?.data || u;
      const userActive = isUserActive(uData);
      const isStaff = category === "staff" || uData?.user_type === "staff" || uData?.role === "staff";
      const affiliation = isStaff ? getStaffAffiliation(uData) : null;

      // Status filter
      if (statusFilter === "active" && !userActive) return false;
      if (statusFilter === "inactive" && userActive) return false;

      // Affiliation filter (staff category only)
      if (category === "staff") {
        if (affiliationFilter === "staffoo" && !affiliation?.isStaffoo) return false;
        if (affiliationFilter === "partners" && affiliation?.isStaffoo) return false;
      }

      return true;
    });
  }, [allUsers, statusFilter, affiliationFilter, category, isUserActive, getStaffAffiliation]);

  // Filter counts for badges
  const filterCounts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let staffoo = 0;
    let partners = 0;

    allUsers.forEach((u) => {
      const uData = u?.data || u;
      const act = isUserActive(uData);
      if (act) active++;
      else inactive++;

      if (category === "staff") {
        const aff = getStaffAffiliation(uData);
        if (aff.isStaffoo) staffoo++;
        else partners++;
      }
    });

    return {
      total: allUsers.length,
      active,
      inactive,
      staffoo,
      partners,
    };
  }, [allUsers, category, isUserActive, getStaffAffiliation]);

  const userSelectOptions = useMemo(() => {
    return filteredUsers.map((u) => {
      const uData = u?.data || u;
      const userActive = isUserActive(uData);
      const isStaff =
        category === "staff" ||
        uData?.user_type === "staff" ||
        uData?.role === "staff";
      const affiliation = isStaff ? getStaffAffiliation(uData) : null;

      const partnerText = affiliation?.partnerName ? ` - ${affiliation.partnerName}` : "";
      const affiliationText = affiliation?.isStaffoo ? " - Staffoo Staff" : partnerText;

      return {
        value: String(uData.id),
        label: `${uData.name || "User"} (${uData.email || uData.phone || "No contact"})${affiliationText}`,
        user: uData,
        userActive,
        isStaff,
        affiliation,
      };
    });
  }, [filteredUsers, isUserActive, category, getStaffAffiliation]);

  const userSelectStyles = useMemo(
    () => ({
      control: (provided, state) => ({
        ...provided,
        borderColor: state.isFocused ? "#0A7C6E" : "#cbd5e1",
        boxShadow: state.isFocused ? "0 0 0 1px #0A7C6E" : "none",
        "&:hover": {
          borderColor: "#0A7C6E",
        },
        borderRadius: "12px",
        minHeight: "44px",
        height: "44px",
        fontSize: "0.85rem",
        backgroundColor: "#fff",
        cursor: "pointer",
      }),
      valueContainer: (provided) => ({
        ...provided,
        padding: "0 12px",
        height: "44px",
      }),
      indicatorsContainer: (provided) => ({
        ...provided,
        height: "44px",
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? "#0A7C6E"
          : state.isFocused
            ? "#f0fdf9"
            : "#fff",
        color: state.isSelected ? "#fff" : "#1e293b",
        cursor: "pointer",
        padding: "8px 12px",
        borderBottom: "1px solid #f8fafc",
      }),
      menu: (provided) => ({
        ...provided,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
        border: "1px solid #e2e8f0",
        zIndex: 99999,
      }),
      menuPortal: (provided) => ({
        ...provided,
        zIndex: 99999,
      }),
    }),
    [],
  );

  const otherUser = (conv) => conv?.user || {};

  const fetchMessages = useCallback(
    async (userId) => {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `${apiURL}api/messages/conversation/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const responseData = await res.json();
        const messageList =
          responseData?.messages?.data || responseData?.data || [];
        dispatch(setMessages(messageList));
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    },
    [token, dispatch],
  );

  const markMessagesAsRead = useCallback(
    async (userId) => {
      try {
        await fetch(`${apiURL}api/messages/read-all/${userId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        dispatch(clearConversationUnread(userId));
        refetchConversations();
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [token, dispatch, refetchConversations],
  );

  // Non-admin: List of admins (Staffoo Admin Support + any admins from api/admin + past conversations)
  const adminUsersList = useMemo(() => {
    if (userType === "admin") return [];
    const list = [];
    const seen = new Set();

    // Staffoo Admin Support (id: 1)
    seen.add("1");
    list.push(DEFAULT_ADMIN);

    // Users fetched from api/admin
    (allUsers || []).forEach((u) => {
      const uData = u?.data || u;
      if (uData && uData.id) {
        const idStr = String(uData.id);
        if (!seen.has(idStr)) {
          seen.add(idStr);
          list.push({
            ...uData,
            user_type: uData.user_type || "admin",
          });
        }
      }
    });

    // Check past conversations for any admin
    (conversations || []).forEach((conv) => {
      const other = conv?.user || {};
      if (other && other.id) {
        const idStr = String(other.id);
        if (!seen.has(idStr)) {
          if (
            other.user_type === "admin" ||
            other.role === "admin" ||
            idStr === "1"
          ) {
            seen.add(idStr);
            list.push(other);
          }
        }
      }
    });

    return list;
  }, [userType, allUsers, conversations]);

  // Non-admin conversation list: maps each admin to existing conversation or a new conversation stub
  const nonAdminConvs = useMemo(() => {
    if (userType === "admin") return [];
    const mapped = adminUsersList.map((admin) => {
      const existingConv = (conversations || []).find(
        (c) => String(c?.user?.id) === String(admin.id),
      );
      if (existingConv) {
        return {
          ...existingConv,
          user: { ...admin, ...(existingConv?.user || {}) },
        };
      }
      return {
        user: admin,
        last_message: null,
        unread_count: 0,
      };
    });

    if (!search.trim()) return mapped;
    const q = search.toLowerCase();
    return mapped.filter((item) => {
      const u = item.user || {};
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [userType, adminUsersList, conversations, search]);

  const filteredConvs = useMemo(() => {
    return (conversations || []).filter((conv) => {
      const other = conv?.user || {};
      const enriched = staffLookup[other?.id]
        ? { ...other, ...staffLookup[other?.id] }
        : other;
      const name = enriched?.name || "";
      const affiliation = getStaffAffiliation(enriched);
      const partnerName = affiliation?.partnerName || "";
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        partnerName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [conversations, staffLookup, search, getStaffAffiliation]);

  // When admin: display filtered existing conversations.
  // When non-admin: display list of admins.
  const displayConvs = userType === "admin" ? filteredConvs : nonAdminConvs;

  const handleSelectConv = useCallback(
    (conv) => {
      const other = otherUser(conv);
      const isSameConv = activeConversation?.user?.id === other?.id;

      if (isSameConv && isMobileView()) {
        setMobileChatActive(true);
        return;
      }

      dispatch(setActiveChat(conv));
      if (other?.id) {
        fetchMessages(other.id);
        markMessagesAsRead(other.id);
      }
      if (isMobileView()) {
        setMobileChatActive(true);
      }
    },
    [activeConversation, dispatch, fetchMessages, markMessagesAsRead],
  );

  // Non-admin support flow: auto-select existing admin chat or auto-initialize support thread
  useEffect(() => {
    if (userType && userType !== "admin") {
      if (!activeConversation && displayConvs.length > 0) {
        handleSelectConv(displayConvs[0]);
      }
    }
  }, [userType, displayConvs, activeConversation, handleSelectConv]);

  const askDeleteMessage = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  const handleDeleteMessage = async () => {
    const messageId = messageToDelete?.id;
    if (!messageId) return;

    setShowDeleteModal(false);
    setMessageToDelete(null);

    try {
      await fetch(`${apiURL}api/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(removeMessage(messageId));
      refetchConversations();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleStartConversation = async (targetUser) => {
    setShowUserPicker(false);

    // If conversation already exists with this user, select it directly
    const existing = (conversations || []).find((c) => {
      const other = otherUser(c);
      return String(other?.id) === String(targetUser?.id);
    });

    if (existing) {
      handleSelectConv(existing);
      return;
    }

    const conv = {
      user: targetUser,
      last_message: null,
      unread_count: 0,
    };

    dispatch(prependConversation(conv));
    dispatch(setActiveChat(conv));
    fetchMessages(targetUser.id);
    markMessagesAsRead(targetUser.id);

    if (isMobileView()) {
      setMobileChatActive(true);
    }
  };

  const handleBackToList = () => {
    setMobileChatActive(false);
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation) return;

    const other = otherUser(activeConversation);
    if (!other?.id) return;

    const payload = {
      receiver_id: other.id,
      message: text,
    };

    setText("");

    try {
      const response = await sendMessageApi("api/messages/send", payload);

      if (response && response.success && response.message) {
        dispatch(setMessages([...messages, response.message]));
      } else {
        fetchMessages(other.id);
      }

      refetchConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const groupedMessages = messages.reduce((groups, msg, idx) => {
    const dateKey = msg.created_at
      ? new Date(msg.created_at).toDateString()
      : "Unknown";
    if (!groups.length || groups[groups.length - 1].dateKey !== dateKey) {
      groups.push({
        dateKey,
        label: formatDate(msg.created_at),
        messages: [{ ...msg, _idx: idx }],
      });
    } else {
      groups[groups.length - 1].messages.push({ ...msg, _idx: idx });
    }
    return groups;
  }, []);



  // Active chat conversation details
  const activeTargetUser = otherUser(activeConversation);
  const activeEnriched = staffLookup[activeTargetUser?.id]
    ? { ...activeTargetUser, ...staffLookup[activeTargetUser?.id] }
    : activeTargetUser;
  const isActiveTargetActive = isUserActive(activeEnriched);
  const isActiveTargetStaff =
    category === "staff" ||
    activeEnriched?.user_type === "staff" ||
    activeEnriched?.role === "staff";
  const activeStaffAffiliation = isActiveTargetStaff
    ? getStaffAffiliation(activeEnriched)
    : null;

  return (
    <div className="dashboard-main chat-room-premium">
      <style>{`
        :root {
          --navy-950: #0a1930;
          --navy-900: #0e2340;
          --teal: #0A7C6E;
          --teal-dark: #075e53;
          --teal-tint: #f0fdf9;
          --teal-border: #d1fae5;
          --amber: #d97706;
          --success: #16a34a;
          --danger: #dc2626;
          --ink: #0f172a;
          --slate: #1e293b;
          --muted: #64748b;
          --faint: #94a3b8;
          --line: #e2e8f0;
          --line-soft: #f1f5f9;
          --surface: #ffffff;
          --canvas: #f8fafc;
        }

        .chat-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 28px 32px 42px;
          margin-bottom: 2rem;
          overflow: hidden;
          isolation: isolate;
        }
        .chat-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .chat-hero::after {
          content: "";
          position: absolute;
          top: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
          z-index: -1;
        }
        .chat-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #6ee7d8;
          margin-bottom: 10px;
        }
        .chat-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .chat-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .chat-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        /* Layout */
        .chatroom-page {
          display: flex;
          gap: 16px;
          height: calc(100vh - 240px);
          min-height: 520px;
        }

        .chatroom-sidebar {
          width: 360px;
          flex-shrink: 0;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          border: 1px solid var(--line-soft);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chatroom-sidebar-header {
          background: #f9fafb;
          border-bottom: 1px solid var(--line-soft);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chatroom-plus-btn {
          width: 36px; height: 36px;
          border-radius: 10px !important;
          background: var(--teal) !important;
          color: #fff !important;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          box-shadow: 0 4px 10px rgba(10,124,110,0.3);
          cursor: pointer;
          transition: transform 0.15s, background-color 0.15s;
        }
        .chatroom-plus-btn:hover {
          background: var(--teal-dark) !important;
          transform: scale(1.05);
        }

        .chatroom-conv-list {
          flex: 1;
          overflow-y: auto;
        }
        .chatroom-conv-item {
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid #f8fafc;
        }
        .chatroom-conv-item:hover {
          background: rgba(248,250,252,0.9);
        }
        .chatroom-conv-active {
          background: rgba(10,124,110,0.08) !important;
          border-left: 3px solid var(--teal);
        }

        .chatroom-main {
          flex: 1;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          border: 1px solid var(--line-soft);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chatroom-main-header {
          background: #f9fafb;
          border-bottom: 1px solid var(--line-soft);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chatroom-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #fafbfc;
        }

        .message-bubble {
          max-width: 75%;
          padding: 10px 16px;
          border-radius: 18px;
          font-size: 0.9rem;
          position: relative;
          word-wrap: break-word;
        }
        .message-sent {
          background: var(--teal);
          color: #fff;
          border-bottom-right-radius: 4px;
          margin-left: auto;
        }
        .message-received {
          background: #fff;
          border: 1px solid var(--line);
          border-bottom-left-radius: 4px;
        }
        .chat-timestamp {
          font-size: 0.65rem;
          margin-top: 4px;
        }
        .chat-date-separator {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted);
          margin: 20px 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chatroom-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--line-soft);
          background: #fff;
        }
        .chatroom-send-btn {
          width: 38px; height: 38px;
          background: var(--teal) !important;
          border: none;
          color: #fff !important;
          box-shadow: 0 4px 10px rgba(10,124,110,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatroom-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          padding: 30px;
        }
        .chatroom-empty-icon {
          width: 74px; height: 74px;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--navy-950), var(--navy-900));
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        /* Status Filter Badges */
        .status-badge-btn {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #475569;
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.15s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .status-badge-btn:hover {
          background: #f8fafc;
        }
        .status-badge-btn.active-status-btn {
          border-color: #a7f3d0;
          color: #16a34a;
          background: #ecfdf5;
        }
        .status-badge-btn.active-status-btn.selected {
          background: #16a34a;
          color: #ffffff;
          border-color: #16a34a;
          box-shadow: 0 2px 8px rgba(22,163,74,0.3);
        }
        .status-badge-btn.inactive-status-btn {
          border-color: #fecaca;
          color: #dc2626;
          background: #fef2f2;
        }
        .status-badge-btn.inactive-status-btn.selected {
          background: #dc2626;
          color: #ffffff;
          border-color: #dc2626;
          box-shadow: 0 2px 8px rgba(220,38,38,0.3);
        }

        /* Filter Pills */
        .filter-pill-btn {
          border: 1px solid var(--line);
          background: #f8fafc;
          color: #475569;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.76rem;
          font-weight: 600;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .filter-pill-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .filter-pill-btn.active {
          background: var(--teal);
          color: #fff;
          border-color: var(--teal);
          box-shadow: 0 2px 6px rgba(10,124,110,0.25);
        }

        .user-picker-card {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid var(--line-soft);
          margin-bottom: 8px;
          transition: all 0.15s ease;
          background: #fff;
          cursor: pointer;
        }
        .user-picker-card:hover {
          background: #f0fdf9;
          border-color: #a7f3d0;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(10,124,110,0.06);
        }

        @media (max-width: 767.98px) {
          .chatroom-page {
            flex-direction: column;
            height: auto;
            min-height: calc(100vh - 160px);
          }
          .chatroom-sidebar {
            width: 100%;
            border-radius: 18px 18px 0 0;
          }
          .chatroom-main {
            border-radius: 0 0 18px 18px;
          }
          .mobile-back-btn {
            display: inline-flex !important;
            margin-right: 8px;
          }
        }
        .mobile-back-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(10,124,110,0.1);
          border: none;
          color: var(--teal);
        }
      `}</style>

      {/* Hero Header */}
      <div className="chat-hero">
        <span className="chat-hero-eyebrow">
          <span className="dot"></span> Support & Chat
        </span>
        <h1>{CATEGORY_LABELS[category] || "Support & Chat"}</h1>
        <p style={{ textTransform: "none" }}>
          {userType !== "admin" || category === "admin"
            ? "Reach out directly to Staffoo administration for real-time support and assistance."
            : "Connect with team members, clients, and resource partners, or provide live support."}
        </p>
      </div>

      <div className="chatroom-page">
        {/* ── LEFT PANEL (Sidebar) ── */}
        <div className={`chatroom-sidebar ${mobileChatActive ? "d-none" : ""} d-md-flex`}>
          {/* Sidebar header */}
          <div className="chatroom-sidebar-header">
            <Avatar
              src={getProfileImageUrlFromUserdata(currentUser)}
              name={currentUser?.name || "Me"}
              size={40}
            />
            <div className="ms-2 flex-grow-1 overflow-hidden">
              <span className="fw-semibold text-truncate d-block">
                {currentUser?.name || "Me"}
              </span>
              <span className="text-muted text-capitalize" style={{ fontSize: "0.72rem" }}>
                {userType === "admin" ? "Staffoo Admin" : userType || "User"}
              </span>
            </div>

            {userType === "admin" && (
              <div className="position-relative" ref={pickerRef}>
              <button
                className="chatroom-plus-btn"
                title={`New ${CATEGORY_LABELS[category] || "chat"}`}
                onClick={() => {
                  setShowUserPicker((v) => !v);
                  setStatusFilter("active");
                }}
              >
                <i className={`fa-solid ${showUserPicker ? "fa-xmark" : "fa-plus"}`}></i>
              </button>

              {/* Little popover dropdown directly anchored to plus icon */}
              {showUserPicker && (
                <div
                  className="chatroom-user-picker shadow-lg"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 1050,
                    width: "330px",
                    background: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "12px",
                    boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
                  }}
                >
                  {/* Status & Affiliation Filter Pills */}
                  <div className="d-flex align-items-center justify-content-between gap-1 mb-2 pb-2 border-bottom flex-wrap">
                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        className={`filter-pill-btn ${statusFilter === "active" ? "active" : ""}`}
                        style={{ padding: "3px 10px", fontSize: "0.72rem" }}
                        onClick={() => setStatusFilter("active")}
                      >
                        Active ({filterCounts.active})
                      </button>
                      <button
                        type="button"
                        className={`filter-pill-btn ${statusFilter === "inactive" ? "active" : ""}`}
                        style={{ padding: "3px 10px", fontSize: "0.72rem" }}
                        onClick={() => setStatusFilter("inactive")}
                      >
                        Inactive ({filterCounts.inactive})
                      </button>
                    </div>

                    {category === "staff" && userType === "admin" && (
                      <div className="d-flex align-items-center gap-1">
                        <button
                          type="button"
                          className={`filter-pill-btn ${affiliationFilter === "all" ? "active" : ""}`}
                          style={{ padding: "3px 10px", fontSize: "0.72rem" }}
                          onClick={() => setAffiliationFilter("all")}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          className={`filter-pill-btn ${affiliationFilter === "staffoo" ? "active" : ""}`}
                          style={{ padding: "3px 10px", fontSize: "0.72rem" }}
                          onClick={() => setAffiliationFilter("staffoo")}
                          title="Staffoo Staff"
                        >
                          Staffoo
                        </button>
                        <button
                          type="button"
                          className={`filter-pill-btn ${affiliationFilter === "partners" ? "active" : ""}`}
                          style={{ padding: "3px 10px", fontSize: "0.72rem" }}
                          onClick={() => setAffiliationFilter("partners")}
                          title="Resource Partners"
                        >
                          Partners
                        </button>
                      </div>
                    )}
                  </div>

                  {/* React Select for Users */}
                  <Select
                    options={userSelectOptions}
                    value={null}
                    onChange={(option) => {
                      if (option?.user) {
                        handleStartConversation(option.user);
                      }
                    }}
                    placeholder={`Select ${statusFilter === "active" ? "active" : "inactive"} user...`}
                    isSearchable
                    autoFocus
                    menuIsOpen={true}
                    maxMenuHeight={260}
                    styles={userSelectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    formatOptionLabel={(option) => (
                      <div className="d-flex align-items-center justify-content-between py-1">
                        <div className="d-flex align-items-center overflow-hidden">
                          <div className="position-relative flex-shrink-0">
                            <Avatar
                              src={getProfileImageUrlFromUserdata(option.user)}
                              name={option.user?.name}
                              size={28}
                            />
                            <span
                              style={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                backgroundColor: option.userActive ? "#16a34a" : "#dc2626",
                                border: "1px solid #fff",
                              }}
                            />
                          </div>
                          <div className="ms-2 overflow-hidden text-start">
                            <div className="fw-semibold text-truncate" style={{ fontSize: "0.8rem", color: "#1e293b", lineHeight: 1.2 }}>
                              {option.user?.name || "Unnamed"}
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: "0.68rem" }}>
                              {option.user?.email || option.user?.phone || "No contact info"}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-1 ms-2 flex-shrink-0">
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: option.userActive ? "#ecfdf5" : "#fef2f2",
                              color: option.userActive ? "#16a34a" : "#dc2626",
                              border: `1px solid ${option.userActive ? "#a7f3d0" : "#fecaca"}`,
                              fontSize: "0.6rem",
                              fontWeight: 600,
                              padding: "1px 5px",
                            }}
                          >
                            {option.userActive ? "Active" : "Inactive"}
                          </span>

                          {option.isStaff && option.affiliation && (
                            option.affiliation.isStaffoo ? (
                              <span
                                className="badge rounded-pill"
                                style={{
                                  backgroundColor: "rgba(10,124,110,0.1)",
                                  color: "#0A7C6E",
                                  border: "1px solid rgba(10,124,110,0.25)",
                                  fontSize: "0.6rem",
                                  fontWeight: 600,
                                  padding: "1px 5px",
                                }}
                              >
                                Staffoo
                              </span>
                            ) : (
                              <span
                                className="badge rounded-pill text-truncate"
                                style={{
                                  backgroundColor: "rgba(139,92,246,0.1)",
                                  color: "#7c3aed",
                                  border: "1px solid rgba(139,92,246,0.25)",
                                  fontSize: "0.6rem",
                                  fontWeight: 600,
                                  padding: "1px 5px",
                                  maxWidth: 95,
                                }}
                                title={option.affiliation.partnerName}
                              >
                                {option.affiliation.partnerName}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    noOptionsMessage={() => (
                      <span className="small text-muted py-2">
                        {loadingUsers ? "Loading users…" : `No ${statusFilter} users found`}
                      </span>
                    )}
                  />
                </div>
              )}
            </div>
            )}
          </div>

          {/* Search conversation */}
          <div className="px-3 py-2">
            <input
              className="form-control form-control-sm bg-light border-0 rounded-3"
              placeholder={userType === "admin" ? "Search conversations..." : "Search support admins..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Conversation list */}
          <div className="chatroom-conv-list">
            {loadingConv && userType === "admin" ? (
              <div className="p-3 text-center text-muted small">Loading conversations…</div>
            ) : displayConvs.length === 0 ? (
              <div className="p-4 text-center text-muted small" style={{ textTransform: "none" }}>
                {userType !== "admin"
                  ? (search ? "No support admins match your search." : (loadingUsers ? "Loading support admins…" : "No support admins available."))
                  : (search ? "No conversations match your search." : "No conversations yet. Press + to start a chat with active or inactive users.")}
              </div>
            ) : (
              displayConvs.map((conv) => {
                const other = otherUser(conv);
                const enriched = staffLookup[other?.id]
                  ? { ...other, ...staffLookup[other?.id] }
                  : other;
                const isActive = activeConversation?.user?.id === other?.id;
                const hasUnread = conv.unread_count > 0;
                const lastMsgText = conv.last_message?.message || "";
                const lastMsgTime = conv.last_message?.created_at || null;
                const isSentByMe = conv.last_message?.is_sent_by_me || false;
                const userActive = isUserActive(enriched);
                const isStaff =
                  category === "staff" ||
                  enriched?.user_type === "staff" ||
                  enriched?.role === "staff";
                const affiliation = isStaff ? getStaffAffiliation(enriched) : null;

                return (
                  <div
                    key={other?.id || String(conv?.user?.id)}
                    className={`chatroom-conv-item d-flex align-items-center px-3 py-2 ${isActive ? "chatroom-conv-active" : ""}`}
                    onClick={() => handleSelectConv(conv)}
                  >
                    <div className="position-relative flex-shrink-0">
                      <Avatar
                        src={getProfileImageUrlFromUserdata(enriched)}
                        name={enriched?.name}
                        size={42}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: userActive ? "#16a34a" : "#dc2626",
                          border: "2px solid #fff",
                        }}
                        title={userActive ? "Active" : "Inactive"}
                      />
                    </div>
                    <div className="ms-2 flex-grow-1 overflow-hidden">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`small text-truncate ${hasUnread ? "fw-bold" : "fw-semibold"}`}>
                          {enriched?.name || "Unknown"}
                        </span>
                        <span className="text-muted" style={{ fontSize: "0.68rem", flexShrink: 0 }}>
                          {formatTime(lastMsgTime)}
                        </span>
                      </div>

                      {/* Badges in sidebar chats: only shown for admin, clean design like dropdown, no icons */}
                      {userType === "admin" && (
                        <div className="d-flex align-items-center gap-1 my-1 flex-wrap">
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: userActive ? "#ecfdf5" : "#fef2f2",
                              color: userActive ? "#16a34a" : "#dc2626",
                              border: `1px solid ${userActive ? "#a7f3d0" : "#fecaca"}`,
                              fontSize: "0.62rem",
                              padding: "2px 6px",
                              fontWeight: 600,
                            }}
                          >
                            {userActive ? "Active" : "Inactive"}
                          </span>

                          {isStaff && affiliation && (
                            affiliation.isStaffoo ? (
                              <span
                                className="badge rounded-pill"
                                style={{
                                  backgroundColor: "rgba(10,124,110,0.1)",
                                  color: "#0A7C6E",
                                  border: "1px solid rgba(10,124,110,0.25)",
                                  fontSize: "0.62rem",
                                  padding: "2px 6px",
                                  fontWeight: 600,
                                }}
                              >
                                Staffoo
                              </span>
                            ) : (
                              <span
                                className="badge rounded-pill text-truncate"
                                style={{
                                  backgroundColor: "rgba(139,92,246,0.1)",
                                  color: "#7c3aed",
                                  border: "1px solid rgba(139,92,246,0.25)",
                                  fontSize: "0.62rem",
                                  padding: "2px 6px",
                                  fontWeight: 600,
                                  maxWidth: 140,
                                }}
                                title={affiliation.partnerName}
                              >
                                {affiliation.partnerName}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center">
                        <div
                          className={`text-truncate ${hasUnread ? "text-dark fw-bold" : "text-muted"}`}
                          style={{ fontSize: "0.75rem" }}
                        >
                          {isSentByMe && lastMsgText && <span className="me-1">You:</span>}
                          {lastMsgText || (
                            <span className="text-muted fst-italic">
                              {userType !== "admin" ? "Tap to chat with admin" : "No messages yet"}
                            </span>
                          )}
                        </div>
                        {hasUnread && (
                          <span className="badge bg-danger rounded-pill ms-1" style={{ fontSize: "0.65rem" }}>
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL (Chat main) ── */}
        <div className={`chatroom-main ${!mobileChatActive ? "d-none" : ""} d-md-flex`}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="chatroom-main-header">
                <div className="d-flex align-items-center overflow-hidden">
                  <button
                    className="mobile-back-btn"
                    onClick={handleBackToList}
                    title="Back to conversations"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                  <div className="position-relative flex-shrink-0">
                    <Avatar
                      src={getProfileImageUrlFromUserdata(activeEnriched)}
                      name={activeEnriched?.name}
                      size={42}
                    />
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 11,
                        height: 11,
                        borderRadius: "50%",
                        backgroundColor: isActiveTargetActive ? "#16a34a" : "#dc2626",
                        border: "2px solid #fff",
                      }}
                      title={isActiveTargetActive ? "Active" : "Inactive"}
                    />
                  </div>
                  <div className="ms-3 overflow-hidden">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <h6 className="mb-0 fw-bold text-truncate" style={{ color: "#1a1a2e", fontSize: "0.98rem" }}>
                        {activeEnriched?.name || "Conversation"}
                      </h6>

                      {/* Status badge: Active (green) or Inactive (red) */}
                      <span
                        className="badge rounded-pill"
                        style={{
                          backgroundColor: isActiveTargetActive ? "#ecfdf5" : "#fef2f2",
                          color: isActiveTargetActive ? "#16a34a" : "#dc2626",
                          border: `1px solid ${isActiveTargetActive ? "#a7f3d0" : "#fecaca"}`,
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          padding: "3px 8px",
                        }}
                      >
                        {isActiveTargetActive ? "Active" : "Inactive"}
                      </span>

                      {/* Admin Badge */}
                      {userType === "admin" &&
                        (activeEnriched?.user_type === "admin" ||
                          activeEnriched?.role === "admin" ||
                          String(activeEnriched?.id) === "1") && (
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: "rgba(10,124,110,0.12)",
                              color: "#0A7C6E",
                              border: "1px solid rgba(10,124,110,0.25)",
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              padding: "3px 8px",
                            }}
                          >
                            Staffoo Admin
                          </span>
                        )}

                      {/* Staff Affiliation Badge: Staffoo Staff vs Resource Partner */}
                      {isActiveTargetStaff && activeStaffAffiliation && (
                        activeStaffAffiliation.isStaffoo ? (
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: "rgba(10,124,110,0.1)",
                              color: "#0A7C6E",
                              border: "1px solid rgba(10,124,110,0.25)",
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              padding: "3px 8px",
                            }}
                          >
                            Staffoo
                          </span>
                        ) : (
                          <span
                            className="badge rounded-pill text-truncate"
                            style={{
                              backgroundColor: "rgba(139,92,246,0.1)",
                              color: "#7c3aed",
                              border: "1px solid rgba(139,92,246,0.25)",
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              padding: "3px 8px",
                            }}
                            title={activeStaffAffiliation.partnerName}
                          >
                            {activeStaffAffiliation.partnerName}
                          </span>
                        )
                      )}
                    </div>
                    <div className="text-muted text-truncate" style={{ fontSize: "0.74rem", textTransform: "none" }}>
                      {activeEnriched?.email || (userType !== "admin" ? "Staffoo Support Team" : "")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="chatroom-messages">
                {loadingMessages ? (
                  <div className="text-center text-muted py-5">
                    <i className="fa fa-spinner fa-spin fa-2x mb-3" style={{ color: "#0A7C6E" }}></i>
                    <p className="small mb-0">Loading messages…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-5">
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "rgba(10,124,110,0.08)",
                      }}
                    >
                      <i className="fa-regular fa-comment-dots fa-2x" style={{ color: "#0A7C6E" }}></i>
                    </div>
                    <h6 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
                      {userType !== "admin" || category === "admin"
                        ? "Welcome to Staffoo Support!"
                        : "Ready to chat!"}
                    </h6>
                    <p
                      className="text-muted small mb-0"
                      style={{ textTransform: "none", maxWidth: 360, margin: "0 auto" }}
                    >
                      {userType !== "admin" || category === "admin"
                        ? "How can we assist you today? Type your message below and an admin will respond promptly."
                        : "No messages yet. Send a message to start the conversation! 👋"}
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.dateKey}>
                      <div className="chat-date-separator">{group.label}</div>
                      {group.messages.map((m) => {
                        const isMe =
                          m.sender_id === user?.id ||
                          m.sender_id === currentUser?.id;
                        return (
                          <div
                            key={m._idx}
                            className={`d-flex mb-3 align-items-end gap-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}
                          >
                            {!isMe && (
                              <Avatar
                                src={getProfileImageUrlFromUserdata(activeEnriched)}
                                name={activeEnriched?.name}
                                size={28}
                              />
                            )}
                            <div className={`message-bubble ${isMe ? "message-sent" : "message-received"} position-relative`}>
                              {isMe && (
                                <button
                                  onClick={() => askDeleteMessage(m)}
                                  className="btn btn-sm btn-link text-white p-0 position-absolute"
                                  style={{ top: "-10px", left: "-20px", opacity: 0.6 }}
                                  title="Delete message"
                                >
                                  <i className="fa-solid fa-trash" style={{ fontSize: "0.75rem", color: "#dc3545" }}></i>
                                </button>
                              )}
                              {m.message}
                              <div className={`chat-timestamp text-end ${isMe ? "text-white-50" : "text-muted"}`}>
                                {formatTime(m.created_at)}
                                {isMe && m.is_read && (
                                  <i className="fa-solid fa-check-double ms-1" style={{ fontSize: "0.6rem", color: "#4dffb5" }}></i>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>

              {/* Footer Input */}
              <div className="chatroom-footer">
                <form onSubmit={onSend} className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control border-0 bg-light rounded-pill"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button
                    className="chatroom-send-btn btn rounded-circle"
                    type="submit"
                    disabled={sending || !text.trim()}
                    title="Send"
                  >
                    {sending ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa-solid fa-paper-plane"></i>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="chatroom-empty-state">
              <div className="chatroom-empty-icon">
                <i className="fa-solid fa-headset" style={{ fontSize: 34, color: "#fff" }}></i>
              </div>
              <h6 className="fw-bold mb-1" style={{ color: "#1a1a2e" }}>
                {userType !== "admin" ? "Staffoo Support" : "No Conversation Selected"}
              </h6>
              <p className="text-muted small text-center mb-0" style={{ maxWidth: 300, textTransform: "none" }}>
                {userType !== "admin"
                  ? "Connecting you to Staffoo Admin Support..."
                  : "Pick a conversation from the left, or press + to start chatting with active or inactive users."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete message confirmation modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMessageToDelete(null);
        }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(220,53,69,0.12)",
            }}
          >
            <i className="fa-solid fa-trash" style={{ color: "#dc3545", fontSize: "1.1rem" }}></i>
          </div>

          <h6 className="fw-bold mb-2">Delete this message?</h6>
          <p className="text-muted small mb-3" style={{ lineHeight: 1.45 }}>
            This action cannot be undone.
            {messageToDelete?.message ? (
              <>
                <br />
                <span className="d-inline-block mt-2 px-2 py-1 rounded bg-light text-dark">
                  "{String(messageToDelete.message).slice(0, 80)}"
                </span>
              </>
            ) : null}
          </p>

          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={() => {
                setShowDeleteModal(false);
                setMessageToDelete(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger px-3"
              onClick={handleDeleteMessage}
            >
              Yes, delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatRoom;