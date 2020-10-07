
const defaultHeight = 6;
const defaultWidth = 12;

interface ClassicPanel {
    name: String,
    viewerType: String, // this is the panelType
    detailLevel?: number,
    queryString: String,
    metricsQueries: String[], // metricsQuery
    timeRange: TimeRange,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    properties: String,
    id: String 
}

interface DashboardV1 {
    name: String,
    detailLevel?: number,
    properties?: string,
    panels: ClassicPanel[]
}

interface LayoutUnit {
    key: String,
    structure: String
}

interface Query {
    queryString: String,
    queryType: "Logs"|"Metrics" | String,
    queryKey: String,
    metricsQueryMode: null,
    metricsQueryData: null
}

interface EpochTimeRangeBoundary {
    type: "EpochTimeRangeboundary" | String,
    epochMillis: Number
}

interface RelativeTimeRangeBoundary {
    type: "RelativeTimeRangeBoundary" | String,
    relativeTime: String
}

interface TimeRange {
    type: "BeginBoundedTimeRange" | String,
    from: EpochTimeRangeBoundary | RelativeTimeRangeBoundary,
    to: EpochTimeRangeBoundary | RelativeTimeRangeBoundary | null
}

interface DashboardV2Panels {
    id: String,
    key: String,
    title: String,
    visualSettings: String,
    keepVisualSettingsConsistentWithParent: true,
    panelType: "SumoSearchPanel" | String,
    queries: Query[],
    description: String,
    timeRange?: TimeRange,
    coloringRules: null,
    linkedDashboards: []
}

interface DashboardV2 {
    type: "DashboardV2SyncDefinition" | String,
    name: String,
    description: String,
    title: String,
    rootPanel: null,
    theme: "Light" | String,
    topologyLabelMap: {
        data: {}
    },
    refreshInterval: 0 | number,
    timeRange: TimeRange,
    layout: {
        layoutType: "Grid" | String,
        layoutStructures: LayoutUnit[]
    },
    panels: DashboardV2Panels[],
    coloringRules: String[]
    variables: String[]
}

const getDefaultTimeRange = (): TimeRange => {
    return {
        type: "BeginBoundedTimeRange",
        from: {
            type: "RelativeTimeRangeBoundary",
            relativeTime: "-15m"
        },
        to: null
    };
}

const buildStructure = (idx: number): String => {
    const xPos = idx % 3;
    const yPos = idx / 3;
    return `{\"height\":${defaultHeight},\"width\":${defaultWidth},\"x\":${xPos * defaultWidth},\"y\":${yPos * defaultHeight},\"minHeight\":3,\"minWidth\":3}`
}

const buildLayout = (classic: DashboardV1): LayoutUnit[] => {
    return classic.panels.map((panel, idx) => {
        return {
            key: idx.toString(),
            structure: buildStructure(idx)
        }
    })
}

const getPanelTypeForMode = (chartType: String, queryString: String, metricsQueries: String[]): String => {
    if (queryString && queryString.includes("timeslice")) {
        return "timeSeries";
    } else if (metricsQueries.length > 0) {
        return "timeSeries";
    } else if (chartType == "text") {
        return "TextPanel";
    } else {
        return "distribution";
    }
}

const getPanelType = (classicPanel: ClassicPanel): String => {
    if (classicPanel.viewerType == "text") {
        return "TextPanel";
    } else {
        return "SumoSearchPanel";
    }
}

const buildVisualSettings = (panel: ClassicPanel): String => {
    const chartType = panel.viewerType;
    const panelType = getPanelTypeForMode(chartType, panel.queryString, panel.metricsQueries);
    return `{\"general\":{\"mode\":\"${panelType}\",\"type\":\"${chartType}\"}}`;
}

const buildQueries = (panel: ClassicPanel): Query[] => {
    const letters = ['A', 'B', 'C', 'D', 'E'];

    if (panel.queryString) {
        return [{
            queryType: "Logs",
            queryKey: "A",
            queryString: panel.queryString,
            metricsQueryData: null,
            metricsQueryMode: null
        }];
    } else {
        // contains metrics queries
        return panel.metricsQueries.map((query, idx) => {
            return {
                queryType: "Metrics",
                queryKey: letters[idx],
                queryString: query,
                metricsQueryMode: null,
                metricsQueryData: null
            };
        });
    }
}

const buildTimeRange = (panel: ClassicPanel): TimeRange | null => {
    if (panel.timeRange != null && panel.viewerType != "text") {
        // todo: actually translate the old timerange please.
        return {
            type: "BeginBoundedTimeRange",
            from: {
                type: "RelativeTimeRangeBoundary",
                relativeTime: "-15m"
            },
            to: null
        }
    }

    return null;
}

const buildPanels = (classic: DashboardV1): DashboardV2Panels[] => {
    return classic.panels.map((panel, idx) => {
        const timeRange = buildTimeRange(panel);
        if (timeRange != null) {
            return {
                id: idx.toString(),
                key: idx.toString(),
                title: panel.name,
                visualSettings: buildVisualSettings(panel),
                keepVisualSettingsConsistentWithParent: true,
                panelType: getPanelType(panel),
                queries: buildQueries(panel),
                description: "",
                timeRange,
                coloringRules: null,
                linkedDashboards: []
            };
        } else {
            return {
                id: idx.toString(),
                key: idx.toString(),
                title: panel.name,
                visualSettings: buildVisualSettings(panel),
                keepVisualSettingsConsistentWithParent: true,
                panelType: getPanelType(panel),
                queries: buildQueries(panel),
                text: "Simple Text Panel",
                description: "",
                coloringRules: null,
                linkedDashboards: []
            };

        }
    });
}

const convert = (classic: DashboardV1): DashboardV2 => {
    const dash = {
        type: "DashboardV2SyncDefinition",
        name: classic.name,
        description: "",
        title: classic.name,
        rootPanel: null,
        theme:  "Light",
        topologyLabelMap: {
            data: {}
        },
        refreshInterval: 0,
        timeRange: getDefaultTimeRange(),
        layout: {
            layoutType: "Grid",
            layoutStructures: buildLayout(classic)
        },
        panels: buildPanels(classic),
        coloringRules: [],
        variables: []
    };
    return dash;
}

export { convert, DashboardV1 }

