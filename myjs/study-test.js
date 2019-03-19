//存放数据的文件夹目录
var dir="json/list.json";

//选择题
var questionDisplay=new Array();

//父部件
var questionRegion;

//整个网页分为几个模块
var partRegion=new Array();
var partDir;
var question=new Array();
var score=new Array();
var partName=new Array();
var button=new Array();

//当前网页处于第几个模块
var presentPart;

//一共有多少个答题模块
var questionPart;

//最终给出的每一部分的建议
var advice=new Array();
//最终每一部分的得分
var finalScore=new Array();

//提示尚未完成
var notFinished;

window.onload = function() {

    //获取父部件
    questionRegion=document.querySelector("#question-region");
    notFinished=document.getElementById("not-finished");

    //获取一共有几个part并存入partDir和相应数组中
    fetch(dir).then(function(response){
        if(response.ok)
        {
            response.json().then(function(json){

                //下面的fetch是异步操作，需要等待所有fetch执行完毕之后才能执行display函数，用count来进行计数
                partDir=json;
                let count=0;
                let maxCount=partDir.length*3;
                questionPart=partDir.length;

                for(let i in partDir)
                {
                    fetch(partDir[i]+"/"+"question.json").then(function(response){
                        response.json().then(function(json){
                            question[i]=json;
                            for(let j=0;j<question[i].length;j++)
                            {
                                question[i][j].weight=Number(question[i][j].weight);
                            }
                            count++;
                            if(count==maxCount)
                                display();
                        })
                    });
                    fetch(partDir[i]+"/"+"score.json").then(function(response){
                        response.json().then(function(json){
                            score[i]=json;
                            count++;
                            if(count==maxCount)
                                display();
                        })
                    });
                    fetch(partDir[i]+"/"+"name.json").then(function(response){
                        response.json().then(function(json){
                            partName[i]=json;
                            count++;
                            if(count==maxCount)
                                display();
                        })
                    });
                }

                // toNum();
                // test
                console.log(partDir);
                console.log(question);
                console.log(score);
                console.log(partName);

                // display();
            });
        }
        else
            console.log("获取",dir,"失败");
    });
};

//将question中的权值weight变为数字
// function toNum()
// {
//     for(let i =0;i<question.length;i++)
//         for(let j=0;j<question[i].length;j++)
//         {
//             question[i][j].weight=Number(question[i][j].weight);
//             console.log(1);
//         }
// }

//生成网页内容
function display()
{
    // test
    // console.log("这是display");
    // console.log(partDir);
    // console.log(question);
    // console.log(score);
    // console.log(partName);

    //初始状态处于第0个模块
    presentPart=0;
    let i=0;
    for(i in question)
    {
        let head;

        partRegion[i]=document.createElement("div");
        head=document.createElement("h2");
        head.textContent=String.fromCharCode(49+Number(i))+". "+partName[i];
        head.setAttribute("name","initial" + i.toString());
        head.className="partHead";
        partRegion[i].appendChild(head);
        questionRegion.appendChild(partRegion[i]);

        for(let j in question[i])
        {
            let newQuestion=new Question(partRegion[i],question[i][j].title,question[i][j].answer,question[i][j].weight,question[i][j].advice,i);
            questionDisplay.push(newQuestion);
            newQuestion.formDiv();
            
            // test
            // console.log("newQuestion=",newQuestion);
        }

        if(i!=presentPart)
            partRegion[i].style.display="none";
        // console.log(i);
    }

    i++;
    //加上两个按钮
    partRegion[i]=document.createElement("div");
    partRegion[i].style.marginTop="20px";
    partRegion[i].style.marginBottom="40px";
    partRegion[i].style.paddingLeft="60px";
    partRegion[i].style.paddingRight="60px";

    for(let j=0;j<2;j++)
    {
        button[j]=document.createElement("button");
        partRegion[i].appendChild(button[j]);
        button[j].className="btn btn-outline-primary mx-auto";
        button[j].type="button";
        button[j].style.opacity="0.6";
        button[j].style.display="block";
        button[j].style.width="150px";
        button[j].style.marginBottom="20px";
    }
    button[0].textContent="上一部分";
    button[1].textContent="下一部分";
    button[0].style.float="left";

    button[1].style.float="right";
    questionRegion.appendChild(partRegion[i]);

    if(presentPart==0)
        button[0].style.display="none";
    if(presentPart==questionPart-1)
        button[1].textContent="提交";

    button[0].onclick=function()
    {
        lastPage();
    }
    
    button[1].onclick=function()
    {
        nextPage();
    }

    //test
    // for(let i in questionDisplay)
    // {
    //     let option=questionDisplay[i].card.querySelectorAll("span");
    //     option[2].click();
    // }
}

//下一页
function nextPage()
{
    //首先检查是否作答所有问题
    let presentQuestion=findQuestion(presentPart);
    // console.log(presentQuestion);
    for(let i in presentQuestion)
        if(presentQuestion[i].choose==null)
        {
            //弹出窗口提示还有内容没有完成
            // alert("请完成所有题目！");
            notFinished.click();
            // window.scrollTo(0,document.body.scrollHeight);
            return;
        }

    //这时所有问题均已完成，并且点击了完成按钮
    if(presentPart==questionPart - 1)
    {
        //弹出提示框，询问是否确认提交
        if(!confirm("确认提交？"))
            return;

        //首先消除掉两个按钮和之前的答题区域
        partRegion[presentPart].style.display="none";
        partRegion[presentPart+1].style.display="none";

        //计算各项信息，进行内容填充
        resultDisplay();
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        return;
    }
    
    //成功进入下一个页面
    partRegion[presentPart].style.display="none";
    presentPart++;
    partRegion[presentPart].style.display="block";

    if(presentPart!=0)
        button[0].style.display="block";

    if(presentPart==questionPart-1)
        button[1].textContent="提交";
    
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    // window.location.hash="#"+partRegion[presentPart].children[0].name;
}

//找到当前页面的所有题目
function findQuestion(num)
{
    let array=new Array();
    for(let i in questionDisplay)
        if(questionDisplay[i].parent===partRegion[num])
            array.push(questionDisplay[i]);
    return array;
}

//尝试进入上一页
function lastPage()
{
    if(presentPart==0)
        return;

    partRegion[presentPart].style.display="none";
    presentPart--;
    partRegion[presentPart].style.display="block";

    if(presentPart==0)
        button[0].style.display="none";

    if(presentPart==questionPart-2)
        button[1].textContent="下一部分";

    document.body.scrollTop = document.documentElement.scrollTop = 0;
    // window.location.hash="#" + partRegion[presentPart].children[0].name;
}

//显示结果
function resultDisplay()
{
    let resultPart=new Array();

    for(let i=0;i<questionPart;i++)
    {
        resultPart[i]=findQuestion(i);
        let scoreArray=new Array();
        let weightArray=new Array();
        let maxScore=new Array();
        advice[i]="";

        for(let j in resultPart[i])
        {
            scoreArray.push(resultPart[i][j].choose);
            weightArray.push(resultPart[i][j].weight);
            maxScore.push(resultPart[i][j].answer.length-1);
            
            let str=getDetailAdvice(resultPart[i][j].choose,resultPart[i][j].advice);
            if(str!==null)
                advice[i]+=str;
            // console.log("str=",str);
            // console.log("advice[i]=",advice[i]);
        }

        // console.log("socreArray=",scoreArray);
        // console.log("weightArray=",weightArray);
        // console.log("maxScore=",maxScore);
        
        finalScore[i]=calculate(scoreArray,weightArray,maxScore);

        let str=getTotalAdvice(finalScore[i],score[i]);
        if(str!==null)
            advice[i]+=str;
    }

    // test
    // console.log("advice=",advice);
    // console.log("finalScore=",finalScore);

    //填充内容
    paintResult();
}

//获取细致建议
function getDetailAdvice(choose,advice)
{
    // console.log(choose);
    // console.log(advice);
    for(let i in advice)
    {
        if(advice[i].answerChosed==choose)
        {
            // console.log(advice[i].detailAdvice);
            return advice[i].detailAdvice;
        }
    }
    return null;
}

//获取总体建议
function getTotalAdvice(finalScore,score1)
{
    for(let i in score1)
        if(finalScore <= Number(score1[i].score))
        {
            // console.log("score1[i].advice=",score1[i].advice);
            return score1[i].advice;
        }
    return null;
}

//计算得分
function calculate(score1,weight,maxScore)
{
    let finalWeight=0;
    let finalScore=0;
    let max=0;

    for(let i in weight)
        finalWeight+=weight[i];

    for(let i in score1)
    {
        finalScore+=(score1[i]*weight[i]/finalWeight);
        max+=(maxScore[i]*weight[i]/finalWeight);
    }

    return finalScore/max;
}

function paintResult()
{
    //答题标签内容创建
    let card;
    let cardHeader;
    let h3;
    let cardBody;
    let form;
    let cardFooter;
    let span;
    let button;

    card=document.createElement("div");
    card.className="card";
    cardHeader=document.createElement("div");
    cardHeader.className="card-header";
    h3=document.createElement("h3");
    h3.textContent="学习能力最终评分"+": ";
    span=document.createElement("span");
    span.className="badge badge-primary";
    span.style.fontSize="1.8rem";
    span.textContent=Math.round(average(finalScore)*100).toString();
    cardBody=document.createElement("div");
    cardBody.className="card-body";
    form=document.createElement("div");
    cardFooter=document.createElement("div");
    cardFooter.className="card-footer";
    button=document.createElement("button");
    button.className="btn btn-primary mx-auto";
    button.type="button";
    button.style.opacity="0.6";
    button.style.display="block";
    button.style.width="200px";
    button.style.marginBottom="20px";
    button.style.marginLeft="100px";
    button.style.marginTop="20px";
    // button.style.float="left";
    button.textContent="再来一遍！";
    button.onclick=function()
    {
        window.location.reload();
    }

    h3.appendChild(span);
    cardHeader.appendChild(h3);
    card.appendChild(cardHeader);
    cardBody.appendChild(form);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    questionRegion.appendChild(card);
    questionRegion.appendChild(button);

    let finalAdvice="";
    for(let i in advice)
        finalAdvice+=((Number(i)+1).toString()+". "+advice[i]+"<br/>");
    cardFooter.innerHTML=finalAdvice;
    form.style.width="600px";
    form.style.height="400px";
    form.className="mx-auto";

    var myChart = echarts.init(form);
    option = {
        title: {
            text: ''
        },
        tooltip: {},
        legend: {
            data: ['学习能力评估结果']
        },
        radar: {
            // shape: 'circle',
            name: {
                textStyle: {
                    color: '#fff',
                    backgroundColor: '#999',
                    borderRadius: 3,
                    padding: [3, 5]
               }
            },
            indicator:getIndicator()
        },
        series: [{
            name: '学习能力评估',
            type: 'radar',
            // areaStyle: {normal: {}},
            data : [
                {
                    value:numberDeal(finalScore),
                    name : '学习能力'
                }
            ]
        }]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

//构造雷达图标题名称
function getIndicator()
{
    let array=new Array();
    for(let i in partName)
    {
        let ob={
            name:partName[i],
            max:100
        };
        array.push(ob);
    }
    return array;
}

//求平均数
function average(array)
{
    let sum=0;
    for(let i in array)
        sum+=array[i];
    return sum/array.length;
}

//处理小数
function numberDeal(array)
{
    let newArray=new Array();
    for(let i in array)
        newArray.push(Math.round(array[i]*100));
    // console.log(newArray);
    return newArray;
}