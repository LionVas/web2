document.addEventListener("DOMContentLoaded", () => {
    const chartTypeSelect = document.getElementById("chartType");
    const xAxisSelect = document.getElementById("chartXAxis");
    const yAxisSelect = document.getElementById("chartYAxis");
    const buildButton = document.getElementById("buildChartBtn");

    const dateParser = d3.timeParse("%d.%m.%Y");
    const dateFormatter = d3.timeFormat("%d.%m.%Y");
    const fields = Object.keys(buildings[0]).map((name) => ({
        name,
        kind: detectColumnType(name),
    }));
    const numericFields = fields.filter((field) => field.kind === "number");
    const placeField = fields.find((field) => field.kind === "category")?.name;
    const depthField = numericFields[2]?.name ?? numericFields[numericFields.length - 1]?.name;
    const dateField = fields.find((field) => field.kind === "date")?.name;
    const yFields = numericFields.slice(0, 2);
    const allowedXFields = fields.filter((field) =>
        field.name === depthField || field.name === dateField
    );
    const allowedYFields = yFields;

    let chartBuiltOnce = false;

    chartTypeSelect.addEventListener("change", updateAxisOptions);
    buildButton.addEventListener("click", renderSelectedChart);

    ["findBtn", "clearFilterBtn", "sortBtn", "resetSortBtn"].forEach((id) => {
        const button = document.getElementById(id);

        if (!button) {
            return;
        }

        button.addEventListener("click", () => {
            if (!chartBuiltOnce) {
                return;
            }

            window.requestAnimationFrame(renderSelectedChart);
        });
    });

    updateAxisOptions();

    function detectColumnType(fieldName) {
        const sampleRow = buildings.find((item) => item[fieldName] !== undefined);
        const sampleValue = sampleRow?.[fieldName];

        if (typeof sampleValue === "number") {
            return "number";
        }

        if (typeof sampleValue === "string" && /^\d{2}\.\d{2}\.\d{4}$/.test(sampleValue)) {
            return "date";
        }

        return "category";
    }

    function updateAxisOptions() {
        const previousX = xAxisSelect.value;
        const previousY = yAxisSelect.value;

        fillSelect(xAxisSelect, allowedXFields, previousX);
        fillSelect(yAxisSelect, allowedYFields, previousY);
    }

    function fillSelect(select, options, previousValue) {
        select.innerHTML = "";

        options.forEach((option) => {
            const element = document.createElement("option");
            element.value = option.name;
            element.textContent = option.name;
            select.append(element);
        });

        const stillAvailable = options.some((option) => option.name === previousValue);
        if (stillAvailable) {
            select.value = previousValue;
            return;
        }

        if (options.length > 0) {
            select.value = chooseDefaultOption(select.id, options);
        }
    }

    function chooseDefaultOption(selectId, options) {
        const chartType = chartTypeSelect.value;

        if (selectId === "chartXAxis") {
            if (chartType === "bar") {
                return options.find((option) => option.kind === "category")?.name ?? options[0].name;
            }

            return options.find((option) => option.kind === "date")?.name ?? options[0].name;
        }

        return options.find((option) => option.kind === "number")?.name ?? options[0].name;
    }

    function renderSelectedChart() {
        clearChart();

        const rows = getTableRows();
        if (rows.length === 0) {
            chartBuiltOnce = false;
            showEmptyState("Нет данных для визуализации. Измените фильтр и повторите построение.");
            return;
        }

        const chartType = chartTypeSelect.value;
        const xField = xAxisSelect.value;
        const yField = yAxisSelect.value;
        const xMeta = fields.find((field) => field.name === xField);

        if (!xMeta || !yField) {
            chartBuiltOnce = false;
            showEmptyState("Нужно выбрать поля по осям X и Y.");
            return;
        }

        if (chartType === "scatter") {
            const points = prepareScatterData(rows, xField, yField, xMeta.kind);

            if (points.length === 0) {
                chartBuiltOnce = false;
                showEmptyState("Для точечной диаграммы не удалось получить числовые значения.");
                return;
            }

            drawScatter(points, xField, yField, xMeta.kind);
            chartBuiltOnce = true;
            return;
        }

        const points = prepareAggregatedData(rows, xField, yField, xMeta.kind);

        if (points.length === 0) {
            chartBuiltOnce = false;
            showEmptyState("Недостаточно данных для построения выбранной диаграммы.");
            return;
        }

        if (chartType === "line") {
            drawLine(points, xField, yField, xMeta.kind);
            chartBuiltOnce = true;
            return;
        }

        drawBar(points, xField, yField);
        chartBuiltOnce = true;
    }

    function getTableRows() {
        const table = document.getElementById("list");
        const rows = Array.from(table.rows);

        if (rows.length < 2) {
            return [];
        }

        const headers = Array.from(rows[0].cells).map((cell) => cell.textContent.trim());

        return rows.slice(1).map((row) => {
            const values = Array.from(row.cells).map((cell) => cell.textContent.trim());

            return headers.reduce((result, header, index) => {
                result[header] = values[index];
                return result;
            }, {});
        });
    }

    function prepareScatterData(rows, xField, yField, xKind) {
        return rows.map((row) => {
            const xValue = parseValue(row[xField], xKind);
            const yValue = Number(row[yField]);

            return {
                xValue,
                yValue,
                rawX: row[xField],
                rawY: row[yField],
                place: placeField ? row[placeField] || "" : "",
            };
        }).filter((row) => isValidAxisValue(row.xValue, xKind) && Number.isFinite(row.yValue));
    }

    function prepareAggregatedData(rows, xField, yField, xKind) {
        const grouped = d3.group(rows, (row) => row[xField]);

        const result = Array.from(grouped, ([rawX, values]) => {
            const numericValues = values
                .map((item) => Number(item[yField]))
                .filter((item) => Number.isFinite(item));

            if (numericValues.length === 0) {
                return null;
            }

            return {
                rawX,
                label: formatAxisValue(rawX, xKind),
                xValue: parseValue(rawX, xKind),
                yValue: d3.mean(numericValues),
                count: numericValues.length,
            };
        }).filter(Boolean);

        return result.sort((first, second) => compareAxisValues(first.xValue, second.xValue, xKind, first.label, second.label));
    }

    function parseValue(value, kind) {
        if (kind === "number") {
            return Number(value);
        }

        if (kind === "date") {
            return dateParser(value);
        }

        return value;
    }

    function formatAxisValue(value, kind) {
        if (kind === "date") {
            const parsed = parseValue(value, kind);
            return parsed ? dateFormatter(parsed) : value;
        }

        return String(value);
    }

    function compareAxisValues(first, second, kind, firstLabel, secondLabel) {
        if (kind === "number") {
            return first - second;
        }

        if (kind === "date") {
            return first - second;
        }

        return firstLabel.localeCompare(secondLabel, "ru");
    }

    function isValidAxisValue(value, kind) {
        if (kind === "number") {
            return Number.isFinite(value);
        }

        if (kind === "date") {
            return value instanceof Date && !Number.isNaN(value.valueOf());
        }

        return value !== "";
    }

    function drawScatter(points, xField, yField, xKind) {
        const baseWidth = xKind === "category"
            ? Math.max(1020, points.length * 80)
            : 1020;
        const svg = createCanvas(baseWidth, 440);
        const margin = { top: 28, right: 30, bottom: 80, left: 80 };
        const width = baseWidth - margin.left - margin.right;
        const height = 440 - margin.top - margin.bottom;

        const group = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const yExtent = d3.extent(points, (point) => point.yValue);
        const xScale = buildDiscreteOrContinuousScale(points, xKind, width);
        const yScale = d3.scaleLinear()
            .domain(expandExtent(yExtent))
            .nice()
            .range([height, 0]);

        const xAxis = group.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(createXAxis(xScale, xKind));
        formatXAxisLabels(xAxis, xKind);

        group.append("g")
            .call(d3.axisLeft(yScale).ticks(8));

        drawGrid(group, width, height, yScale);

        group.selectAll("circle")
            .data(points)
            .join("circle")
            .attr("cx", (point) => getScaledX(point, xScale, xKind))
            .attr("cy", (point) => yScale(point.yValue))
            .attr("r", 5)
            .attr("fill", "#e85d04")
            .attr("fill-opacity", 0.8)
            .attr("stroke", "#8f2d00");

        appendLabels(svg, width, height, margin, xField, yField);
    }

    function drawLine(points, xField, yField, xKind) {
        const baseWidth = xKind === "category"
            ? Math.max(1020, points.length * 80)
            : 1020;
        const svg = createCanvas(baseWidth, 440);
        const margin = { top: 28, right: 30, bottom: 80, left: 80 };
        const width = baseWidth - margin.left - margin.right;
        const height = 440 - margin.top - margin.bottom;

        const group = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = buildDiscreteOrContinuousScale(points, xKind, width);
        const yScale = d3.scaleLinear()
            .domain(expandExtent(d3.extent(points, (point) => point.yValue)))
            .nice()
            .range([height, 0]);

        const xAxis = group.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(createXAxis(xScale, xKind));
        formatXAxisLabels(xAxis, xKind);

        group.append("g")
            .call(d3.axisLeft(yScale).ticks(8));

        drawGrid(group, width, height, yScale);

        const line = d3.line()
            .x((point) => getScaledX(point, xScale, xKind))
            .y((point) => yScale(point.yValue));

        group.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "#0f766e")
            .attr("stroke-width", 3)
            .attr("d", line);

        group.selectAll("circle")
            .data(points)
            .join("circle")
            .attr("cx", (point) => getScaledX(point, xScale, xKind))
            .attr("cy", (point) => yScale(point.yValue))
            .attr("r", 5)
            .attr("fill", "#14b8a6")
            .attr("stroke", "#115e59");

        appendLabels(svg, width, height, margin, xField, yField);
    }

    function drawBar(points, xField, yField) {
        const baseWidth = Math.max(1020, points.length * 80);
        const svg = createCanvas(baseWidth, 440);
        const margin = { top: 28, right: 30, bottom: 100, left: 80 };
        const width = baseWidth - margin.left - margin.right;
        const height = 440 - margin.top - margin.bottom;

        const group = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(points.map((point) => point.label))
            .range([0, width])
            .padding(0.45);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(points, (point) => point.yValue)])
            .nice()
            .range([height, 0]);

        group.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");

        group.append("g")
            .call(d3.axisLeft(yScale).ticks(8));

        drawGrid(group, width, height, yScale);

        group.selectAll("rect")
            .data(points)
            .join("rect")
            .attr("x", (point) => xScale(point.label))
            .attr("y", (point) => yScale(point.yValue))
            .attr("width", xScale.bandwidth())
            .attr("height", (point) => height - yScale(point.yValue))
            .attr("fill", "#2563eb")
            .attr("rx", 8);

        appendLabels(svg, width, height, margin, xField, yField);
    }

    function createCanvas(width, height) {
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .style("width", `${width}px`)
            .style("height", `${height}px`)
            .style("max-width", "none");

        return svg;
    }

    function buildContinuousScale(kind, extent, range) {
        const safeExtent = expandExtent(extent);

        if (kind === "date") {
            return d3.scaleTime()
                .domain(safeExtent)
                .range(range);
        }

        return d3.scaleLinear()
            .domain(safeExtent)
            .range(range);
    }

    function buildDiscreteOrContinuousScale(points, kind, width) {
        if (kind === "category") {
            return d3.scalePoint()
                .domain(points.map((point) => point.label))
                .range([0, width])
                .padding(0.5);
        }

        return buildContinuousScale(kind, d3.extent(points, (point) => point.xValue), [0, width]);
    }

    function getScaledX(point, scale, kind) {
        return kind === "category" ? scale(point.label) : scale(point.xValue);
    }

    function createXAxis(scale, kind) {
        const axis = d3.axisBottom(scale);

        if (kind === "date") {
            axis.ticks(d3.timeWeek.every(2));
            axis.tickFormat(d3.timeFormat("%d.%m.%Y"));
        }

        return axis;
    }

    function formatXAxisLabels(axisGroup, kind) {
        if (kind !== "date") {
            return;
        }

        axisGroup.selectAll("text")
            .attr("transform", "rotate(-35)")
            .style("text-anchor", "end");
    }

    function expandExtent(extent) {
        const [minValue, maxValue] = extent;

        if (minValue instanceof Date && maxValue instanceof Date) {
            const minTime = minValue.getTime();
            const maxTime = maxValue.getTime();

            if (minTime === maxTime) {
                return [new Date(minTime - 86400000), new Date(maxTime + 86400000)];
            }

            return [minValue, maxValue];
        }

        if (minValue === maxValue) {
            const offset = minValue === 0 ? 1 : Math.abs(minValue) * 0.1;
            return [minValue - offset, maxValue + offset];
        }

        const padding = (maxValue - minValue) * 0.05;
        return [minValue - padding, maxValue + padding];
    }

    function drawGrid(group, width, height, yScale) {
        group.append("g")
            .attr("class", "grid")
            .call(
                d3.axisLeft(yScale)
                    .ticks(8)
                    .tickSize(-width)
                    .tickFormat("")
            )
            .call((grid) => grid.select(".domain").remove())
            .call((grid) => grid.selectAll("line").attr("stroke", "#d6dfeb").attr("stroke-dasharray", "3 3"));

        group.selectAll(".grid").lower();
        group.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", height)
            .attr("y2", height)
            .attr("stroke", "#9fb1c7");
    }

    function appendLabels(svg, width, height, margin, xLabel, yLabel) {
        svg.append("text")
            .attr("x", margin.left + width / 2)
            .attr("y", margin.top + height + 52)
            .attr("text-anchor", "middle")
            .attr("font-size", 14)
            .text(xLabel);

        svg.append("text")
            .attr("transform", `translate(24 ${margin.top + height / 2}) rotate(-90)`)
            .attr("text-anchor", "middle")
            .attr("font-size", 14)
            .text(yLabel);
    }

    function clearChart() {
        d3.select("#chart").selectAll("svg, .chart-empty").remove();
    }

    function showEmptyState(message) {
        d3.select("#chart")
            .append("div")
            .attr("class", "chart-empty")
            .style("padding", "2rem 1rem")
            .style("color", "#5f6c7b")
            .style("text-align", "center")
            .text(message);
    }

});
