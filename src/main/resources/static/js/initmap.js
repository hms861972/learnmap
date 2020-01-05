/*************定义地图全局变量*********************/
var map;    //定义地图对象
var proj = 'EPSG:4326';   //定义wgs84地图坐标系
var proj_m = 'EPSG:3857';   //定义墨卡托地图坐标系
var mapLayer, mapLayerlabel;  //定义图层对象
var source_measure, vector_measure;  //定义全局测量控件源和层
var source_point, vector_point;    //定义全局点对象源和层
var popup;  //定义全局变量popup
var source_zx, vector_zx;    //定义全局折线对象源和层
var l;  //定义一根全局折线
var source_bezier, vector_bezier;    //定义全局贝塞尔曲线对象源和层
var source_arrow, vector_arrow;    //定义全局箭头线对象源和层
var source_polygon, vector_polygon;    //定义全局多边形对象源和层
var source_circle, vector_circle;    //定义全局多边形对象源和层
var source_region, vector_region;    //定义全局多边形对象源和层
var source_draw, vector_draw;    //定义全局鼠标绘制对象源和层
var mapDragInteraction;       //定义拖动交互功能
/**
 * 地图初始化函数
 */
function initMap(){
    mapDragInteraction = new app.Drag();
    //初始化map对象
    map = new ol.Map({
        target:"map",
        projection:proj,
        interactions: ol.interaction.defaults().extend([mapDragInteraction]),
        view: new ol.View({
            center:ol.proj.transform([101.46912,36.24274],proj,proj_m),
            zoom:5
        })
    });
    //初始化地图图层
    mapLayer = new ol.layer.Tile({
        source:source_google,
        projection:proj
    });
    //初始化标签图层
    mapLayerlabel = new ol.layer.Tile({
        source:null,
        projection:proj
    });
    //将图层加载到地图对象
    map.addLayer(mapLayer);
    map.addLayer(mapLayerlabel);
    //导航控件
    map.addControl(new ol.control.ZoomSlider());
    //鼠标位置控件
    map.addControl(new ol.control.MousePosition({
        projection: proj,
        coordinateFormat: function (coordinate) {
            var zoom = map.getView().getZoom();
            return '地图级别:' + zoom + ",  " + ol.coordinate.format(coordinate, '经度:{x}°,  纬度: {y}°', 10);
        }
    }));
    //比例尺控件
    map.addControl(new ol.control.ScaleLine());
    //全屏显示控件
    map.addControl(new ol.control.FullScreen());
    //鹰眼图控件
    map.addControl(new ol.control.OverviewMap({
        tipLabel: "鹰眼图"
    }));

    /*******************在地图初始化函数中初始化测量控件层************************/
    source_measure = new ol.source.Vector();
    vector_measure = new ol.layer.Vector({
        source: source_measure,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.1)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ff8080',
                width: 2
            })
        })
    });

    map.addLayer(vector_measure);

    /*******************在地图初始化函数中初始化点对象标注层************************/
    source_point = new ol.source.Vector();

    vector_point = new ol.layer.Vector({
        source: source_point
    });

    map.addLayer(vector_point);

    /************************在地图初始化时添加popup标记******************************/
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    popup = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        },
        offset: [0, -32]
    }));
    map.addOverlay(popup);

    //为popup上的close按钮添加关闭事件
    closer.onclick = function () {
        popup.setPosition(undefined);
        closer.blur();
        return false;
    }

    /*******************在地图初始化函数中初始化折线对象标注层************************/
    source_zx = new ol.source.Vector();

    vector_zx = new ol.layer.Vector({
        source: source_zx
    });

    map.addLayer(vector_zx);
    /*******************在地图初始化函数中初始化贝塞尔曲线标注层************************/
    source_bezier = new ol.source.Vector();
    vector_bezier = new ol.layer.Vector({
        source:source_bezier
    });
    map.addLayer(vector_bezier);
    /*******************在地图初始化函数中初始化箭头线标注层************************/
    source_arrow = new ol.source.Vector();

    vector_arrow = new ol.layer.Vector({
        source: source_arrow
    });

    map.addLayer(vector_arrow);

    /*******************在地图初始化函数中初始化多边形面标注层************************/
    source_polygon = new ol.source.Vector();

    vector_polygon = new ol.layer.Vector({
        source: source_polygon
    });

    map.addLayer(vector_polygon);

    /*******************在地图初始化函数中初始化圆标注层************************/
    source_circle = new ol.source.Vector();

    vector_circle = new ol.layer.Vector({
        source: source_circle
    });

    map.addLayer(vector_circle);


    /*******************在地图初始化函数中初始化多边形面标注层************************/
    source_region = new ol.source.Vector();

    vector_region = new ol.layer.Vector({
        source: source_region
    });

    map.addLayer(vector_region);

    /*******************在地图初始化函数中初始化鼠标绘制标注层************************/
    source_draw = new ol.source.Vector();

    vector_draw = new ol.layer.Vector({
        source: source_draw
    });

    map.addLayer(vector_draw);


    /*******************在图中监听pointermove事件************************/
    map.on('pointermove', pointerMoveHandler);  //在measure.js中实现pointerMoveHandler函数
    map.on('pointermove', function (e) {
        if (e.dragging) {
            popup.setPosition(undefined);
            closer.blur();
            return;
        }
    });
    //添加地图单击事件
    map.on('singleclick', function (evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (f) {
            return f;
        });
        if (feature && feature.get("id") != null && feature.get("lx") == "Point") {
            popup.setPosition(feature.getGeometry().getCoordinates());
            var strHtml = '<div style="width: 420px;height: 260px;">';
            strHtml += '<div style="width: 100%;height: 50px;font-family:幼圆;font-size: 24pt;line-height: 50px">' + feature.getStyle().getText().getText() + '</div>';
            strHtml += '<div style="width: 100%;height: 150px;"> ';
            strHtml += '<div style="width: 150px;height: 150px;float: left;"><img src="../images/nodata.png" style="width: 100%;height: 100%;" /></div>';
            strHtml += '<div style="float: left;width: 230px;height: 110px;padding: 20px;font-size:12pt;">简述：这是一个点对象的测试示例，你可以根据需要定制出更多的弹出框版式。</div>';
            strHtml += '</div>';
            var jwd = ol.proj.transform([feature.get("lon"), feature.get("lat")], 'EPSG:3857', 'EPSG:4326');
            strHtml += '<div style="width: 100%;height: 60px; padding: 10px;color: gray;font-size: 11pt;font-family:幼圆;line-height: 25px;">';
            strHtml += '<div style="float: left;width: 48%;border-bottom: 1px gray dotted;"><div style="float: left;width: 80px;text-align: left">经度：</div><div style="float: right;width: 120px;text-align: right">' + parseInt(jwd[0] * 100000000) / 100000000 + '°</div></div>';
            strHtml += '<div style="float: right;width: 48%;border-bottom: 1px gray dotted;"><div style="float: left;width: 80px;text-align: left">纬度：</div><div style="float: right;width: 120px;text-align: right">' + parseInt(jwd[1] * 100000000) / 100000000 + '°</div></div>';
            strHtml += '<div style="float: left;width: 48%;border-bottom: 1px gray dotted;"><div style="float: left;width: 80px;text-align: left">地理位置：</div><div style="float: right;width: 120px;text-align: right">测试位置</div></div>';
            strHtml += '<div style="float: right;width: 48%;border-bottom: 1px gray dotted;"><div style="float: left;width: 80px;text-align: left">联系电话：</div><div style="float: right;width: 120px;text-align: right">185********</div></div>';
            strHtml += '</div>';
            strHtml += '</div>';
            content.innerHTML = strHtml;
            setPointPropertygrid(feature);
        } else {
            popup.setPosition(undefined);
            closer.blur();
        }
    });

}

/******************地图切换方法***************/
function changeBaseMap(sourcelist) {
    var cnt = sourcelist.length;
    if (1 == cnt) {
        mapLayer.setSource(sourcelist[0]);
        mapLayerlabel.setSource(null);
    } else if (2 == cnt) {
        mapLayer.setSource(sourcelist[0]);
        mapLayerlabel.setSource(sourcelist[1]);
    }
}
/******************测量控件切换方法***************/
function startControl(control, self) {
    if (self.attr("class").indexOf("l-btn-plain-selected") >= 0) {
        $(".easyui-linkbutton").linkbutton("unselect");
        self.linkbutton("select");
        removeMeasure(source_measure);
        if ("line" == control || "area" == control) {
            addMeasure(control, source_measure);
        }else if ("rectSelect" == control) {
            addDrawOnMap("Box");
            drawonmap.on('drawend', function (evt) {
                var extent = evt.feature.getGeometry().getExtent();    //得到选中的区域
                var leftdownPoint = ol.proj.transform([extent[0], extent[1]], proj_m, proj);
                var rightupPoint = ol.proj.transform([extent[2], extent[3]], proj_m, proj);
                alert("左下坐标：" + leftdownPoint + "\n" + "右上坐标：" + rightupPoint);
            });
        } else if ("circleSelect" == control) {
            addDrawOnMap("Circle");
            drawonmap.on('drawend', function (evt) {
                var center = ol.proj.transform(evt.feature.getGeometry().getCenter(), proj_m, proj);
                var radius = evt.feature.getGeometry().getRadius();
                alert("圆心坐标：" + center + "\n" + "半径：" + radius);
            });
        }
    } else {
        self.linkbutton("unselect");
        removeMeasure(source_measure);
        clearDrawOnMap();
    }
}

/******************在地图上标记一个点对象***************/
//随机生成当前范围内的一个经纬度坐标，用于在地图上标点
function randomPointJWD() {
    var topleftPoint = map.getCoordinateFromPixel([10, 10]);
    var centerPoint = map.getView().getCenter();
    var bottomrightPoint = [centerPoint[0] + (centerPoint[0] - topleftPoint[0]), centerPoint[1] + (centerPoint[1] - topleftPoint[1])];
    var jd = topleftPoint[0] + (bottomrightPoint[0] - topleftPoint[0]) * Math.random();
    var wd = bottomrightPoint[1] + (topleftPoint[1] - bottomrightPoint[1]) * Math.random();
    return [jd, wd];
}

//设置点对象属性值
function setPointPropertygrid(point) {
    var d = $('#pg_point').propertygrid("getData");
    d.rows[0].value = point.get('id');
    d.rows[1].value = point.get('lx');
    var p = ol.proj.transform([point.get('lon'), point.get('lat')], proj_m, proj);
    d.rows[2].value = Math.floor(p[0] * 100000000) / 100000000;
    d.rows[3].value = Math.floor(p[1] * 100000000) / 100000000;
    d.rows[4].value = point.getStyle().getImage().getOpacity();
    d.rows[5].value = point.getStyle().getImage().getScale();
    d.rows[6].value = point.getStyle().getImage().getRotateWithView();
    d.rows[7].value = point.getStyle().getImage().getRotation();
    d.rows[8].value = point.getStyle().getImage().getSrc();
    d.rows[9].value = point.getStyle().getText().getTextAlign();
    d.rows[10].value = point.getStyle().getText().getTextBaseline();
    d.rows[11].value = point.getStyle().getText().getFont();
    d.rows[12].value = point.getStyle().getText().getText();
    d.rows[13].value = point.getStyle().getText().getFill().getColor();
    for (var i = 0; i < d.total; i++) {
        $('#pg_point').propertygrid("refreshRow", i);
    }
}

//添加一个点
var point_sl = 0;
//layer:{ol.source.Vector}:需要添加点对象的图层
//label:{string}:点对象名称
//iconname:{string}:点对象的图标名称
function addPoint(layer, label, iconname) {
    var p = randomPointJWD();
    var style = createStyle(1, 1, false, 0, "../images/imgpoints/" + iconname, 'center', 'bottom', 'bold 12px 幼圆', label + point_sl, '#aa3300');
    var p = createPoint("point" + point_sl, "Point", p[0], p[1], style);
    layer.addFeature(p);
    setPointPropertygrid(p);
    point_sl++;
}

//更新点对象属性值
//layer:{ol.source.Vector}:需要更新点对象的图层
function updatePoint(layer) {
    var d = $('#pg_point').propertygrid("getData");
    var f = layer.getFeatureById(d.rows[0].value);      //通过id在点图层上找到相应的Feature对象
    var style = createStyle(d.rows[4].value, d.rows[5].value, d.rows[6].value, d.rows[7].value, d.rows[8].value, d.rows[9].value, d.rows[10].value, d.rows[11].value, d.rows[12].value, d.rows[13].value);
    var jd = parseInt(d.rows[2].value * 100000000) / 100000000;
    var wd = parseInt(d.rows[3].value * 100000000) / 100000000;
    var jwd = ol.proj.transform([jd, wd], proj, proj_m);
    var p = createPoint(f.get("id"), f.get("lx"), jwd[0], jwd[1], style);  //根据新的属性重新构造一个点对象
    layer.removeFeature(f);  //删除老的点对象
    layer.addFeature(p);     //在图层上添加点对象
}

/******************在地图上标记一个折线对象***************/
var timer_zx;//定时器返回对象
var zx_sl = 1;//计数
var isRun = false;//防止定时器window.setInterval启动多次
function startDrawLine() {
    if (null == l) {
        var style = createLineStyle("black", 2, 'round', 'round');
        l = createLine("zxtest", "zx", [], style);
        source_zx.addFeature(l);
    }
    var coord;
    if (isRun){
        return;
    }
    isRun = true;
    timer_zx = window.setInterval(function () {
        coord = randomPointJWD();
        l.getGeometry().appendCoordinate(coord);
        $("#zx_croodinates").html($("#zx_croodinates").html() + zx_sl++ + "." + ol.proj.transform(coord, proj_m, proj) + "<br>");
    }, 1000);
}

function stopDrawLine() {
    isRun = false;
    window.clearInterval(timer_zx);
}

function clearDrawLine() {
    stopDrawLine();
    source_zx.removeFeature(l);
    l = null;
    $("#zx_croodinates").html("");
    zx_sl = 1;
}
/**************************绘制贝塞尔曲线*****************************/
function drawBezierCurve(n) {
    var arrPoints = [];
    for (var i = 0; i <= n; i++) {
        arrPoints.push(randomPointJWD());
    }
    var arrbline = createBezierCurvePoints(n, arrPoints);
    var style = createLineStyle("#ff0080", 2, 'round', 'round');
    var f = createLine("bezier_nj" + Math.random(), "bezier", arrbline, style);
    source_bezier.addFeature(f);
}
function clearBezierCurve() {
    source_bezier.clear();
}
/**************************绘制箭头线*****************************/
var arrow_sl = 0;
function drawArrowLine() {
    var arrarrow = createArrowPoints(map.getCoordinateFromPixel([300 + arrow_sl * 10, 350 + arrow_sl * 10]), map.getCoordinateFromPixel([500 + arrow_sl * 10, 500 + arrow_sl * 10]), map.getCoordinateFromPixel([700 + arrow_sl * 10, 300 + arrow_sl * 10]));
    var style = createLineStyle("#ff8000", 2, 'round', 'round');
    var f = createLine("arrow" + Math.random(), "arrow", arrarrow, style);
    source_arrow.addFeature(f);
    arrow_sl++;
}

function clearArrowLine() {
    source_arrow.clear();
}

/**************************绘制多边形区域*****************************/
function randomScreenPixel(r) {
    var centerSceenPixel = map.getPixelFromCoordinate(map.getView().getCenter()); //获取地图中心点的屏幕坐标
    var screenX = Math.floor(r + (centerSceenPixel[0] * 2 - 2 * r) * Math.random());
    var screenY = Math.floor(r + (centerSceenPixel[1] * 2 - 2 * r) * Math.random());
    return [screenX, screenY];
}

function drawRegularPolygon(n) {
    var r = 100;   //定义正多边形外接圆的半径，单位是像素
    var centerScreenPolygon = randomScreenPixel(r);  //随机生成多边形外接圆圆心点像素坐标
    var arrPoints = new Array();
    //得到正多边形各个端点的像素坐标
    var cpx, cpy;
    for (var i = 0; i < n; i++) {
        cpx = Math.floor(r * Math.cos(i * 2 * Math.PI / n)) + centerScreenPolygon[0];
        cpy = Math.floor(r * Math.sin(i * 2 * Math.PI / n)) + centerScreenPolygon[1];
        arrPoints.push(map.getCoordinateFromPixel([cpx, cpy]));
    }
    arrPoints.push(arrPoints[0]);

    var style = createPolygonStyle("#ff0080", 2, 'rgba(0, 255, 0, 0.2)');
    var f = createPolygon("polygon" + Math.random(), "polygon", [arrPoints], style);
    source_polygon.addFeature(f);
}

function clearRegularPolygon() {
    source_polygon.clear();
}
/**************************绘制圆形区域*****************************/
function drawCircle() {
    var center = randomPointJWD();
    var style = createPolygonStyle("#000080", 2, 'rgba(0, 0, 255, 0.2)');
    var f = createCircle("circle" + Math.random(), "circle", center, parseInt($("#txt_radius").textbox("getText")), style);
    source_circle.addFeature(f);
}

function clearCircle() {
    source_circle.clear();
}

/**************************在屏幕中间绘制集结地域*****************************/
var region_sl=0;
function drawRegion() {
    var p1 = map.getCoordinateFromPixel([500+region_sl*10, 300+region_sl*10]);
    var p2 = map.getCoordinateFromPixel([660+region_sl*10, 250+region_sl*10]);
    var p3 = map.getCoordinateFromPixel([700+region_sl*10, 400+region_sl*10]);
    var style = createPolygonStyle("#800080", 2, 'rgba(200, 0, 255, 0.1)');
    var arrPoints = createRegionPoints(p1, p2, p3);
    var f = createPolygon("region" + Math.random(), "region", [arrPoints], style);
    source_region.addFeature(f);
    region_sl++;
}

function clearRegion() {
    source_region.clear();
}
/**************************用鼠标绘制各种图形*****************************/
var drawonmap; // global so we can remove it later
function addDrawOnMap(type) {   //The geometry type. One of 'Point', 'LineString', 'LinearRing', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection', 'Circle'.
    if (drawonmap) {
        map.removeInteraction(drawonmap);
    }
    if (type !== 'None') {
        var geometryFunction, maxPoints;
        if (type === 'Square') {
            type = 'Circle';
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
        } else if (type === 'Box') {
            type = 'LineString';
            maxPoints = 2;
            geometryFunction = function (coordinates, geometry) {
                if (!geometry) {
                    geometry = new ol.geom.Polygon(null);
                }
                var start = coordinates[0];
                var end = coordinates[1];
                geometry.setCoordinates([
                    [start, [start[0], end[1]], end, [end[0], start[1]], start]
                ]);
                return geometry;
            };
        }

        var style = createPolygonStyle("#808080", 2, 'rgba(200, 0, 255, 0.1)');
        drawonmap = new ol.interaction.Draw({
            source: source_draw,
            style: style,
            type: /** @type {ol.geom.GeometryType} */ (type),
            geometryFunction: geometryFunction,
            maxPoints: maxPoints
        });
        map.addInteraction(drawonmap);
    }
}

function clearDrawOnMap() {
    source_draw.clear();
    addDrawOnMap("None");
}

/*****************************开启或关闭图上feature的拖动函数*******************************/
function dragChange(flag) {
    if (flag) {
        map.addInteraction(mapDragInteraction);
    } else {
        map.removeInteraction(mapDragInteraction);
    }
}