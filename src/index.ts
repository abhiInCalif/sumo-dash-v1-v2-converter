
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

const buildStructure = (classicPanel: ClassicPanel): String => {
    return `{\"height\":${classicPanel.height},\"width\":${classicPanel.width},\"x\":${classicPanel.x.valueOf() - 1},\"y\":${classicPanel.y.valueOf() - 1}}`
}

const buildLayout = (classic: DashboardV1): LayoutUnit[] => {
    return classic.panels.map((panel, idx) => {
        return {
            key: getKey(idx),
            structure: buildStructure(panel)
        }
    })
}

const getPanelTypeForMode = (chartType: String, queryString: String, metricsQueries: String[]): String => {
    if (queryString && queryString.includes("timeslice")) {
        return "timeSeries";
    } else if (metricsQueries.length > 0) {
        return "timeSeries";
    } else if (isTitleorTextPanel(chartType)) {
        return "TextPanel";
    } else {
        return "distribution";
    }
}

const getPanelType = (classicPanel: ClassicPanel): String => {
    if (isTitleorTextPanel(classicPanel.viewerType)) {
        return "TextPanel";
    } else {
        return "SumoSearchPanel";
    }
}

const getChartType = (viewerType: String): String => {
    if (isTitleorTextPanel(viewerType)) {
        return "text";
    } else {
        return viewerType;
    }
}

const getTitleFontSize = (viewerType: String): String => {
    if (viewerType == "title") {
        return "\"fontSize\": 20 ";
    } else {
        return "\"fontSize\": 16 ";
    }
}

const buildVisualSettings = (panel: ClassicPanel): String => {
    const chartType = getChartType(panel.viewerType);
    const panelType = getPanelTypeForMode(chartType, panel.queryString, panel.metricsQueries);
    const titleFontSize = getTitleFontSize(panel.viewerType)
    return `{\"title\": {${titleFontSize}}, \"general\": {\"mode\":\"${panelType}\",\"type\":\"${chartType}\", \"displayType\": \"default\", \"outlierBandColor\": \"#FDECF5\", \"outlierBandMarkerColor\": \"#F032A9\", \"outlierBandFillOpacity\": 0.3, \"outlierBandLineThickness\": 2, \"outlierBandMarkerSize\": 10, \"outlierBandMarkerType\": \"triangle\", \"fillOpacity\": 1, \"aggregationType\": \"average\", \"groupBy\": [] }, \"axes\": {}, \"legend\": {}, \"color\": {}, \"hiddenQueryKeys\": [], \"overrides\": [], \"series\": {}}`;
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
    if (panel.timeRange != null && !isTitleorTextPanel(panel.viewerType)) {
        return panel.timeRange
    }

    return null;
}

const buildPanels = (classic: DashboardV1): DashboardV2Panels[] => {
    return classic.panels.map((panel, idx) => {
        const timeRange = buildTimeRange(panel);
        if (timeRange != null && !isTitleorTextPanel(panel.viewerType)) {
            return {
                id: idx.toString(),
                key: getKey(idx),
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
        } 
        if (isTitleorTextPanel(panel.viewerType)) {
            return {
                id: idx.toString(),
                key: getKey(idx),
                title: panel.name,
                visualSettings: buildVisualSettings(panel),
                keepVisualSettingsConsistentWithParent: true,
                panelType: getPanelType(panel),
                queries: [],
                text: getPanelText(panel),
                description: "",
                coloringRules: null,
                linkedDashboards: []
            };
        }
        else {
            return {
                id: idx.toString(),
                key: getKey(idx),
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

function isTitleorTextPanel(viewerType: String) {
    return viewerType == "text" || viewerType == "title";
}

function getKey(idx: number): string {
    return "panelPANE-" + idx.toString();
}

function getPanelText(panel: ClassicPanel): any | string | undefined {
    try {
        var text : String = JSON.parse(panel.properties.toString())["settings"]["text"]["configuration"]["text"]
        text = text.replace(/\#\#\#/g, "").toString()
        return text
    }
    catch {
        return ""
    }
}

