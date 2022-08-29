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

var treeList = [];
var datalen = 0, unit = 0, unit2 = 0;

function getExtremum(datas, index){
    let lens = datas.length;
    if(lens < 1) return null;
    var extre_list = [];
    for(let i=1; i<lens-1;i++){
        let le = datas[i][index] - datas[i-1][index];
        let ri = datas[i][index] - datas[i+1][index];
        if((le<=0 && ri<0)||(le>0 && ri>=0)){
            extre_list.push([datas[i][0], datas[i][index]]);
        }
    }
    return extre_list;
}

class scanTree{
    constructor(leftp, rightp, leftc = null, rightc = null){
        this.leftp = leftp;
        this.rightp = rightp;
        this.leftc = leftc;
        this.rightc = rightc;
        this.direction = leftp[1] < rightp[1];
    }

    show(depth = 0){
        console.log("depth:", depth, "left point:", this.leftp, 
            "right point:", this.rightp);
        if(this.leftc !== null){
            this.leftc.show(depth+1);
            this.rightc.show(depth+1);
        }
    }

    split(point){
        this.leftc = new scanTree(this.leftp, point);
        this.rightc = new scanTree(point, this.rightp);
    }

    subtree(point){
        let curTree = this;
        while(curTree.leftc !== null){
            let p = curTree.leftc.rightp;
            if (p[0] >= point[0])
                curTree = curTree.leftc;
            else
                curTree = curTree.rightc;
        }
        return curTree;
    }

    insert(point){
        let tmptree = this.subtree(point);
        tmptree.split(point);
    }

    draw(depth = 0, unit = 1, start = 0, offset = 0, x_terminal = 0, y_terminal = 0){
        var wi = unit*(this.rightp[0]-this.leftp[0])-offset;
        var x = unit*(this.leftp[0]-start)+m_t.left;
        var y = depth*55+m_t.top;
        if(wi<5){
            console.log("the area is small to show all the tree");
            return null;
        }
        var color = this.direction === true ? "black" : "gray";
        svg_t.append("rect")
            .attr("x",x)
            .attr("y",y)
            .attr("width",wi)
            .attr("height",50)
            .attr("fill",color);
        if(this.leftc !== null){
            this.leftc.draw(depth+1, unit, start, 5);
            this.rightc.draw(depth+1,unit, start, offset);
        }
        else if(y+50+m_t.bottom > svg_t.attr("height")){
            svg_t.attr("height", y+50+m_t.bottom);
        }
    }

    simpleDraw(unit = 1, start = 0, y = 20, color = "black", x_terminal = 0, y_terminal = 0, type = 0){
        if(this.leftc !== null){
            if(((this.rightp[0]-this.leftp[0]) > x_terminal) && 
                (Math.abs(this.rightp[1]-this.leftp[1]) > y_terminal))
                color = this.direction === true ? "black" : "white";
            this.leftc.simpleDraw(unit, start, y, color, x_terminal, y_terminal, type);
            this.rightc.simpleDraw(unit, start, y, color,x_terminal, y_terminal, type);
        }
        else{
            var wi = unit*(this.rightp[0]-this.leftp[0]);
            var x = unit*(this.leftp[0]-start)+m_b.left;
            if(((this.rightp[0]-this.leftp[0]) > x_terminal) && 
                (Math.abs(this.rightp[1]-this.leftp[1]) > y_terminal))
                color = this.direction === true ? "black" : "white";
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

function drawBarcode(x_terminal = 0, y_terminal = 0){
    svg_b.selectAll("*").remove();
    let svg_b_height = 55*treeList.length+m_b.top+m_b.bottom-5;
    if(svg_b_height > height_b)
        svg_b.attr("height", svg_b_height);
    for(let i=0; i<treeList.length;i++){
        let color = treeList[i].direction === true ? "black" : "white";
        treeList[i].simpleDraw(unit2, datas[0][0], 55*i+m_b.top, color, x_terminal, y_terminal, i);
    }

    svg_b.selectAll("rect")
        .on("click", function(d, i){
            svg_t.selectAll("*").remove();
            svg_t.attr("height", height_t);
            let t = d3.select(this).attr("class");
            treeList[t].draw(0, unit, datas[0][0]);
            t++;
            g_l.selectAll("path").attr("stroke", "purple").attr("stroke-width",1);
            g_l.select(".line_"+t).attr("stroke", "red").attr("stroke-width",3);
        })

}

function getAndDrawBarcode(){
    treeList.splice(0,treeList.length);

    datalen = (datas[datas.length-1][0] - datas[0][0]);
    unit = (width_t-m_t.left-m_t.right) / datalen;
    unit2 = (width_b-m_b.left-m_b.right) / datalen;

    for(let i=1; i<datas[0].length; i++){
        var tlist = getExtremum(datas, i);
        tlist.sort(function(a,b){ return a[1]-b[1]})
            .reverse();
        // console.log(tlist);
        tree = new scanTree([datas[0][0], datas[0][i]],
                [datas[datas.length-1][0], datas[datas.length-1][i]]);
        for(let j=0; j<tlist.length;j++){
            tree.insert([tlist[j][0], tlist[j][1]]);
        }
        treeList.push(tree);
    }

    drawBarcode();

    // console.log(unit, width_t, data2[data2.length-1][0] - data2[0][0]);
    svg_t.selectAll("*").remove();
    svg_t.attr("height", height_t);
    treeList[0].draw(0, unit, datas[0][0]);

}

// init
getAndDrawBarcode();

