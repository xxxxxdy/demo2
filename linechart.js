const width_l = document.getElementsByClassName("line-chart")[0].offsetWidth;
const height_l = document.getElementsByClassName("line-chart")[0].offsetHeight;

const svg_l = d3.select(".line-chart")
  .append("svg")
  .attr("width", width_l)
  .attr("height", height_l);

// 创建一个g 当后面元素的group容器，移到（100，30）的位置
const m_l = { top: 30, right: 20, bottom: 30, left: 40 };
const g_l = svg_l.append("g").attr("transform", "translate(40, 30)");
// 实际我们图的高度宽度
const gW_l = width_l - m_l.left - m_l.right;
const gH_l = height_l - m_l.top - m_l.bottom;

var parseData = d3.timeParse("%m/%d/%Y");

var xScale_l;
var yScale_l;

function drawLineChart(){
  g_l.selectAll("*").remove();

  // console.log(datas);
  if(Number(datas[0][0])!==Number(datas[0][0])){
    datas.forEach(function(d){
      d[0] = parseData(d[0]);
    })
    xScale_l = d3.scaleTime().range([0, gW_l])
                  .domain(d3.extent(datas, function(d){ return d[0]}));
  }
  else{
    xScale_l = d3.scaleLinear().range([0, gW_l])
                .domain([d3.min(datas, item => item[0]), d3.max(datas, item => item[0])]);
  }
  g_l.append("g")
      .attr("transform", `translate(0, ${gH_l})`)
      .call(d3.axisBottom(xScale_l))
      .attr("stroke", "black");

  yScale_l = d3.scaleLinear().range([gH_l, 0]);
  var maxY = d3.max(datas, item => item[1]);
  var minY = d3.min(datas, item => item[1]);
  let maxDiff = maxY - minY;
  for(let i=2; i<datas[0].length; i++){
    let maxTmp = d3.max(datas, item => item[i]);
    let minTmp = d3.min(datas, item => item[i]);
    if(maxTmp > maxY) maxY = maxTmp;
    if(minTmp < minY) minY = minTmp;
    if(maxTmp-minTmp > maxDiff) maxDiff = maxTmp-minTmp;
  }
  yScale_l.domain([minY, maxY]);
  g_l.append("g")
    .call(d3.axisLeft(yScale_l))
    .attr("stroke", "black");

  for(let i = 1; i<datas[0].length; i++){
    // 创建一个line的生成器 用d3.line,把所有点连起来
    const line_l = d3.line()
      .x(d => {
        return xScale_l(d[0]);
      })
      .y(d => {
        return yScale_l(d[i]);
      });
    //.curve(d3.curveCatmullRom);

    g_l.append("path")
      .attr("d", line_l(datas))
      .attr("class","line")
      .attr("id","line_"+i)
      .attr("fill", "none")
      .attr("stroke", "blue");
  }

  y_range.max = maxDiff
  y_range.step = maxDiff > 100 ? 1: maxDiff/ 100;
  y_range.value = 0;
  y_text.value = 0;

}

// init
drawLineChart();


// function drawCircle(xScale_l, yScale_l, index = 1, showText = true){
//   // 应该是标签问题只能有一条线显示点
//   // 先给点画上小圆圈和文字，创建一个文字和圆圈的group
//   // join那句可以改为以前v4写法.enter().append('circle')
//   const group1_l = g_l
//     .selectAll(".group-circle-text")
//     .data(datas)
//     .join("g")
//     .attr("class", "group-circle-text");

//   group1_l.selectAll("circle")
//     .data(datas)
//     .join("circle")
//     .attr("cx", d => {
//       return xScale_l(d[0]);
//     })
//     .attr("cy", d => {
//       return yScale_l(d[index]);
//     })
//     .attr("r", 3)
//     .attr("fill", "red");

//   if(showText){
//     group1_l.selectAll("text")
//       .data(datas)
//       .join("text")
//       .attr("x", d => {
//         return xScale_l(d[0]) + 2;
//       })
//       .attr("y", d => yScale_l(d[index]) - 2)
//       .text(d => d[index]);
//   }
// }


// function drawLineChart(showCircle = true){
//   // 清空画布
//   g_l.selectAll("*").remove();

//   // 定义x坐标轴的比例尺，gW为x轴的宽度
//   // const xScale_l = d3.scaleBand().range([0, gW_l]);
//   const xScale_l = d3.scaleLinear().range([0, gW_l]);
//   // 定义好x轴d定义域，画出x轴axisBottom，底部
//   let minX = d3.min(datas,item => Number(item[0]));
//   let maxX = d3.max(datas,item => Number(item[0]));
//   xScale_l.domain([minX-0.02*(maxX-minX),maxX+0.02*(maxX-minX)]);
//   g_l.append("g")
//     .attr("transform", `translate(0, ${gH_l})`)
//     .call(d3.axisBottom(xScale_l))
//     .attr("stroke", "black");

//   // 定义y坐标轴的比例尺，gH为y轴的宽度
//   const yScale_l = d3.scaleLinear().range([gH_l, 0]);
//   // 定义好y轴d定义域，画出y轴，y轴画在左边axisLeft
//   var maxY = d3.max(datas, item => Number(item[1]));
//   var minY = d3.min(datas, item => Number(item[1]));
//   let maxDiff = maxY - minY;
//   for(let i=2; i<datas[0].length; i++){
//     let maxTmp = d3.max(datas, item => Number(item[1]));
//     let minTmp = d3.min(datas, item => Number(item[1]));
//     if(maxTmp > maxY) maxY = maxTmp;
//     if(minTmp < minY) minY = minTmp;
//     if(maxTmp-minTmp > maxDiff) maxDiff = maxTmp-minTmp;
//   }

//   yScale_l.domain([minY-0.02*(maxY-minY), maxY+0.02*(maxY-minY)]);
//   g_l.append("g")
//     .call(d3.axisLeft(yScale_l))
//     .attr("stroke", "black");

//   for(let i = 1; i<datas[0].length; i++){
//     // 创建一个line的生成器 用d3.line,把所有点连起来
//     const line_l = d3.line()
//       .x(d => {
//         return xScale_l(d[0]);
//       })
//       .y(d => {
//         return yScale_l(d[i]);
//       });
//     //.curve(d3.curveCatmullRom);

//     g_l.append("path")
//       .attr("d", line_l(datas))
//       .attr("class","line")
//       .attr("id","line_"+i)
//       .attr("fill", "none")
//       .attr("stroke", "blue");
//   }

//   // update terminal
//   // x_range.max = maxX - minX;
//   // x_range.step = (maxX - minX)/100;
//   // x_range.value = 0;
//   // x_text.value = 0;
//   y_range.max = maxDiff
//   y_range.step = maxDiff/100;
//   y_range.value = 0;
//   y_text.value = 0;
// }
