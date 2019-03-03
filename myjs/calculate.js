//计算得分及评价的相关方法

function Calculate(score,weight,maxScore)
{
    let finalWeight=0;
    let finalScore=0;

    for(let i in weight)
        finalWeight+=weight;

    for(let i in score)
        finalScore+=(score[i]*weight[i]/finalWeight);

    return finalScore/maxScore;
}