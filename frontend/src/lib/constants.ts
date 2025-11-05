export const TYPESENSE_CONFIG = {
    nodes: [
        { url: "http://localhost:8108" }
    ],
    apiKey: "xyz",
    numRetries: 3,
    retryIntervalSeconds: 2,
    connectionTimeoutSeconds: 2,
    healthcheckIntervalSeconds: 30,
};

export const SEARCH_CONFIG = {
    query_by: "title",
    highlight_full_fields: "title",
    highlight_affix_num_tokens: 10,
    highlight_start_tag: '<mark class="highlight">',
    highlight_end_tag: "</mark>",
    include_fields: "title,relative_path",
};