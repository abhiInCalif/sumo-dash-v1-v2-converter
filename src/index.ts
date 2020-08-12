
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
    timeRange: TimeRange,
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

const getPanelType = (chartType: String, queryString: String, metricsQueries: String[]): String => {
    if (queryString && queryString.includes("timeslice")) {
        return "timeSeries";
    } else if (metricsQueries.length > 0) {
        return "timeSeries";
    } else {
        return "distribution";
    }
}

const buildVisualSettings = (panel: ClassicPanel): String => {
    const chartType = panel.viewerType;
    const panelType = getPanelType(chartType, panel.queryString, panel.metricsQueries);
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

const buildTimeRange = (panel: ClassicPanel): TimeRange => {
    return {
        type: "BeginBoundedTimeRange",
        from: {
            type: "RelativeTimeRangeBoundary",
            relativeTime: "-15m"
        },
        to: null
    }
}

const buildPanels = (classic: DashboardV1): DashboardV2Panels[] => {
    return classic.panels.map((panel, idx) => {
        return {
            id: idx.toString(),
            key: idx.toString(),
            title: panel.name,
            visualSettings: buildVisualSettings(panel),
            keepVisualSettingsConsistentWithParent: true,
            panelType: "SumoSearchPanel",
            queries: buildQueries(panel),
            description: "",
            timeRange: buildTimeRange(panel),
            coloringRules: null,
            linkedDashboards: []
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

export { convert }

