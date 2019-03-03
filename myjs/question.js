//question答题类

function Question(parent,title,answer,weight,advice,order)
{
    this.parent=parent;
    this.title=title;
    this.answer=answer;
    this.advice=advice;
    this.weight=weight;
    this.order=order;
    this.choose=null;
}

Question.prototype.formDiv=function()
{
    //答题标签内容创建
    let card;
    let cardHeader;
    let h3;
    let cardBody;
    let form;
    let formGroup;

    this.card=card=document.createElement("div");
    this.card.className="card";
    cardHeader=document.createElement("div");
    cardHeader.className="card-header";
    h3=document.createElement("h3");
    h3.textContent=this.title;
    cardBody=document.createElement("div");
    cardBody.className="card-body";
    form=document.createElement("form");
    formGroup=document.createElement("div");
    formGroup.className="form-group";

    cardHeader.appendChild(h3);
    card.appendChild(cardHeader);
    form.appendChild(formGroup);
    cardBody.appendChild(form);
    card.appendChild(cardBody);
    this.parent.appendChild(card);

    for(let i in this.answer)
    {
        //标签以及其中的单选框和内容
        let label;
        let input;
        let span;

        label=document.createElement("label");
        label.className="form-control";
        input=document.createElement("input");
        input.type="radio";
        input.name="question"+this.order.toString();
        input.value=i.toString();
        label.appendChild(input);
        span=document.createElement("span");
        span.flag=i;
        span.textContent=String.fromCharCode(65+Number(i))+". "+this.answer[i];
        label.appendChild(span);
        formGroup.appendChild(label);
    }

    let oldThis=this;
    //设置鼠标点击事件
    card.onclick=function(e)
    {
        if(e.target.nodeName.toLowerCase()!=="input")
            return;
        oldThis.choose=e.target.parentElement.children[1].flag;
    }
}