const DOCUMENT_LABELS = {
    working_with_children: "Working with Children Check",
    white_card: "White Card",
    msic_card: "MSIC Card",
    control_room_certificate: "Control Room Certificate",
    ras_certificate: "RAS Certificate",
};

export const parseRequiredDocuments = (documentListRaw, isDocumentFlag) => {
    if (!isDocumentFlag) return [];
    if (!documentListRaw) return [];

    try {
        const parsed = typeof documentListRaw === "string"
            ? JSON.parse(documentListRaw)
            : documentListRaw;

        if (!Array.isArray(parsed)) return [];

        return parsed.map((code) => ({
            code,
            label: DOCUMENT_LABELS[code] || code.replace(/_/g, " "),
        }));
    } catch (e) {
        console.warn("Failed to parse document_list:", documentListRaw, e);
        return [];
    }
};