
const {DoughnutElement} = CroppedDoughnutChart

function writeTable(siteData) {

    var tickIcon = function (data, type, row) {
        if (data == 1) {
            return '<i class="fa fa-check" style="color:green"/>';
        }
        return "";
    };
    var noZero = function renderZero(data) {
        if (data == 0) {
            return '';
        }
        return data;
    }
    const columns = [
        {data: 'Site'},
        {data: 'Site-Status', render: tickIcon},
        {data: "Servers-UP"},
        {data: "Servers-Down", render: noZero},
        {data: "Servers-Unknown", render: noZero},
        {data: "Cameras-Up"},
        {data: "Cameras-Down", render: noZero},
        {data: "Cameras-Unknown", render: noZero}
    ]

    $('#example').DataTable({
        // responsive:true,
        paging: true,
        "iDisplayLength": 50,
        fixedRowHeight: false,
        filter: true,
        data: siteData,
        columns


    });


}

function drawChart(data) {

    drawSiteChart(data);
    drawServerChart(data);
    drawCameraChart(data);
}

$(document).ready(function () {
    initData();

});

function drawSiteChart(data) {

    const aggregatedResult = data.reduce((acc, cur) => {
        let {up, down} = acc;
        if (cur['Site-Status'] === '0') {
            down++;
        } else {
            up++;
        }
        return {up, down}

    }, {up: 0, down: 0})
    const items = [
        {value: aggregatedResult.up, color: "green"},
        {value: aggregatedResult.down, color: "red"},
    ]


    let imgUrl = "./assets/site.svg";
    const result = DoughnutElement(items, {
        radius: 75,
        title: "Sites",
        titleColor: "#000000",
        thicknessSize: "M",
        gapSize: "L",
        labelSize: 12,
        labelColor: "white",
        backgroundColor: "white",
        imgUrl
    });
    const siteChartContainer = document.getElementById("sites-chart");
    siteChartContainer.appendChild(result);
}

function drawServerChart(data) {
    const aggregatedResult = data.reduce((acc, cur) => {
        let {up, down, unknown} = acc;
        up += parseInt(cur['Servers-UP']);
        down += parseInt(cur['Servers-Down']);
        unknown += parseInt(cur['Servers-Unknown']);
        console.log({up, down, unknown})
        return {up, down, unknown}

    }, {up: 0, down: 0, unknown: 0})
    const items = [
        {value: aggregatedResult.up, color: "green"},
        {value: aggregatedResult.down, color: "red"},
        {value: aggregatedResult.unknown, color: "#FF9632"},
    ]


    let imgUrl = "./assets/server.svg";
    const result = DoughnutElement(items, {
        radius: 75,
        title: "Servers",
        titleColor: "#000000",
        thicknessSize: "M",
        gapSize: "L",
        labelSize: 12,
        labelColor: "white",
        backgroundColor: "white",
        imgUrl
    });
    const siteChartContainer = document.getElementById("servers-chart");
    siteChartContainer.appendChild(result);
}

function drawCameraChart(data) {

    const aggregatedResult = data.reduce((acc, cur) => {
        let {up, down, unknown} = acc;
        up += parseInt(cur['Cameras-Up']);
        down += parseInt(cur['Cameras-Down']);
        unknown += parseInt(cur['Cameras-Unknown']);
        return {up, down, unknown}

    }, {up: 0, down: 0, unknown: 0})
    const items = [
        {value: aggregatedResult.up, color: "green"},
        {value: aggregatedResult.down, color: "red"},
        {value: aggregatedResult.unknown, color: "#FF9632"},
    ]


    let imgUrl = "./assets/camera.svg";
    const result = DoughnutElement(items, {
        radius: 75,
        title: "Cameras",
        titleColor: "#000000",
        thicknessSize: "M",
        gapSize: "L",
        labelSize: 12,
        labelColor: "white",
        backgroundColor: "white",
        imgUrl
    });
    const siteChartContainer = document.getElementById("cameras-chart");
    siteChartContainer.appendChild(result);
}
