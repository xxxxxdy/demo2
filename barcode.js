const width_b = document.getElementsByClassName("barcode")[0].offsetWidth;
const height_b = document.getElementsByClassName("barcode")[0].offsetHeight;
const width_t = document.getElementsByClassName("tree")[0].offsetWidth;
const height_t = document.getElementsByClassName("tree")[0].offsetHeight;

const svg_t = d3.select(".tree")
    .append("svg")
    .attr("width", width_t)
    .attr("height", height_t);

const svg_b = d3.select(".barcode")
    .append("svg")
    .attr("width", width_b)
    .attr("height", height_b);

const m_t = { top: 20, right: 20, bottom: 20, left: 20 };
const m_b = { top: 20, right: 25, bottom: 20, left: 20 };

var barcodeList = [];
var datalen = 0, unit = 0, unit2 = 0;

function getExtremum(datas, idx, flag = false){
    let lens = datas.length;
    if(lens < 2) return null;
    var extre_list = [];
    if(flag ^ (datas[0][idx] < datas[1][idx])){
        extre_list.push([datas[0][0], datas[0][idx]])
    }
    for(let i=1; i<lens-1;i++){
        if((flag ^ (datas[i][idx] <= datas[i-1][idx]))
            && ( flag ^ (datas[i][idx] < datas[i+1][idx]))){
            extre_list.push([datas[i][0], datas[i][idx]]);
        }
    }
    if(flag ^ (datas[lens-1][idx] <= datas[lens-2][idx])){
        extre_list.push([datas[lens-1][0], datas[lens-1][idx]])
    }
    return extre_list;
}

class Slope{
    constructor(start){
        this.start =  start;
        this.end = null;
        this.persistent = -1;
    }

    death(end){
        this.end = end;
        this.persistent = this.start[1] - end[1];
    }
}

class Barcode{
    constructor(begin, stop){
        this.slist = [];
        this.spoint = null;
        this.begin = begin;
        this.stop = stop;
    }

    borns(points){
        // points is sort by key
        for(let i=0; i<points.length; i++){
            this.slist.push(new Slope(points[i]));
        }
    }

    kills(points){
        // points is sort by value
        for(let i=0; i<points.length; i++){
            let le = -1, ri = -1;
            for(let j=0; j<this.slist.length; j++){
                if(this.slist[j].persistent === -1){
                    if(this.slist[j].start[0] < points[i][0]) {
                        le = j;
                    }
                    else{
                        ri = j;
                        break;
                    }
                }
            }

            let sidx = -1;
            if(le !== -1){
                if(ri !== -1){
                    sidx = this.slist[le].start[1] < this.slist[ri].start[1] ? le : ri;
                }
                else sidx = le;
            }
            else sidx = ri;

            if(sidx === -1) {
                this.spoint = points[i];
                continue;
            }
            this.slist[sidx].death(points[i]);
        }
    }


    simpleDraw(unit = 1, start = 0, y = 20, y_terminal = 0, type = 0){
        let point_list = [this.begin, this.stop];
        if(this.spoint !== null) point_list.push(this.spoint);
        for(let i=0; i < this.slist.length; i++){
            if(this.slist[i].persistent !== -1 && this.slist[i].persistent < y_terminal) continue;
            point_list.push(this.slist[i].start);
            if(this.slist[i].end !== null) point_list.push(this.slist[i].end);
        }

        point_list.sort(function(a,b){return a[0]-b[0]});
        for(let i=0;i<point_list.length-1;i++){
            var wi = unit*(point_list[i+1][0]-point_list[i][0]);
            var x = unit*(point_list[i][0]-start)+m_b.left;
    
            let color = point_list[i][1]<point_list[i+1][1] ? "black" : "white";
            svg_b.append("rect")
                .attr("x",x)
                .attr("y",y)
                .attr("width",wi)
                .attr("height",50)
                .attr("fill",color)
                .attr("class", type);
        }
    }

}

function drawBarcode(y_terminal = 0){
    svg_b.selectAll("*").remove();
    let svg_b_height = 55*barcodeList.length+m_b.top+m_b.bottom-5;
    if(svg_b_height > height_b)
        svg_b.attr("height", svg_b_height);
    else
        svg_b.attr("height", height_b);
    for(let i=0; i<barcodeList.length;i++){
        barcodeList[i].simpleDraw(unit2, datas[0][0], 55*i+m_b.top, y_terminal, i);
    }

    svg_b.selectAll("rect")
        .on("click", function(d, i){
            // svg_t.selectAll("*").remove();
            // svg_t.attr("height", height_t);
            let t = d3.select(this).attr("class");
            // barcodeList[t].draw(0, unit, datas[0][0]);
            t++;
            // 
            g_l.selectAll(".line").attr("stroke", "blue").attr("stroke-width",1).attr("stroke-opacity",0.1);
            g_l.select("#line_"+t).attr("stroke", "red").attr("stroke-width",3).attr("stroke-opacity",1.0);
            console.log(barcodeList[t-1]);
        })

}

function getAndDrawBarcode(){
    barcodeList.splice(0,barcodeList.length);

    datalen = (datas[datas.length-1][0] - datas[0][0]);
    unit = (width_t-m_t.left-m_t.right) / datalen;
    unit2 = (width_b-m_b.left-m_b.right) / datalen;

    for(let i=1; i<datas[0].length; i++){
        var tmin = getExtremum(datas, i);
        var tmax = getExtremum(datas, i, true);
        // console.log(tmin, tmax);

        tmin.sort(function(a,b){ return a[1]-b[1]}).reverse();
        // tmax.sort(function(a,b){ return a[0]-b[0]});
        
        barcode = new Barcode([datas[0][0], datas[0][i]], 
            [datas[datas.length-1][0], datas[datas.length-1][i]]);
        barcode.borns(tmax);
        barcode.kills(tmin);

        barcodeList.push(barcode);
    }

    // console.log(barcodeList);
    drawBarcode();

    // console.log(unit, width_t, data2[data2.length-1][0] - data2[0][0]);
    svg_t.selectAll("*").remove();
    svg_t.attr("height", height_t);

}-

// init
getAndDrawBarcode();

