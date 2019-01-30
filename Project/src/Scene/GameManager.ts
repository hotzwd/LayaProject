/*
作者:Mo
跳山羊场景核心功能
*/
const GameEvent =
{
    PlayerDeath:"PlayerDeath",
    GameTimeUp:"GameTimeUp",
    GameContinue:"GameContinue"
}

//游戏玩法管理
class GameManager
{
    //常量定义
    //每行最大格子数
    static LineStepNum:number = 5 + 2;
    //最大行数
    static MaxLineNum:number = 13;
    //格子边长
    static StepLength:number = 0.5;
    //格子斜对角长度
    static StepDistance:number = Math.sqrt((GameManager.StepLength*GameManager.StepLength)*2);
    
    //对外接口
    private static _Mgr:GameManager;
    static get Mgr():GameManager
    {
        if(GameManager._Mgr == null)
        {
            GameManager._Mgr = new GameManager();
        }
        return GameManager._Mgr;
    }
    SceneMgr:SceneManager;
    CurScene:GameScene;
    get GameDir():GameDirector
    {
        return this.CurScene.GameDir;
    }
    //进入游戏场景走这个接口
    EnterScene():void
    {
        var newGameScene = new GameScene();
        SceneManager.Mgr.EnterScene(newGameScene);
        this.CurScene = newGameScene;
    }

    //内部功能
    constructor()
    {
        this.SceneMgr = SceneManager.Mgr;
    }

    //生成BUFF表现效果
    GenBuffEffect(type:ItemType):Laya.Sprite3D
    {
        return new Laya.Sprite3D();
    }
}

//游戏场景
class GameScene extends BaseScene
{
    ModelLoad:boolean;
    GameDir:GameDirector;
    //对外接口
    StartLoad()
    {
        Laya.loader.load(["res/uijson/PlayerList.json","res/uijson/GameScene.json","res/uijson/EndGame.json"],Laya.Handler.create(this,this._LoadComplete));
        super.StartLoad();
    }

    //内部功能
    constructor()
    {
        super();
    }
    
    protected _Start():void
    {
        super._Start();
    }

    protected _Update():void
    {
        super._Update();
    }

    protected _GenDir():void
    {
        this.GameDir = new GameDirector();
        this.CurDir = this.GameDir;

    }
//         APP.MessageCenter.DesRgistIDK(GameEvent.PlayerDeath);
    //离开时进行配置
    protected _Leave():void
    {
        APP.MessageCenter.DesRgistIDK(GameEvent.PlayerDeath);
        super._Leave();
    }
    protected _LoadComplete()
    {
        this.Scene = new Laya.Scene();
        super._LoadComplete();
    }
}

//游戏导演
class GameDirector extends BaseDirector
{
    Camera:GameCamera;
    GameScene:BaseScene;
    MountLines:MountLine[];
    Player:Player;
    InputCtrl:BaseGameInput;
    ItemLayout:ItemLayout;
    CurLineRewards:Array<LineItemInfo>;
    CurLineBarriers:Array<LineItemInfo>
    get SafeLocation():MLocation
    {
        return this._SafeLocation;
    }
    private _SafeLocation:MLocation;
    AddInputCtrler(value:BaseGameInput)
    {
        value.NextInput = this.InputCtrl;
        this.InputCtrl = value;
    }
    PopInputCtrler()
    {
        this.InputCtrl = this.InputCtrl.NextInput;
    }
    AddGold(num:number)
    {
        this._GoldNum += num;
        this.AddLogicGold(num);
    }
    AddGoldUnLogicGold(num:number)
    {
        this._GoldNum += num;
    }
    AddLogicGold(num:number)
    {
        this.PanelUI.AddGold(num);
    }

    //设置安全位置
    SetSafePS(location:MLocation)
    {
        if(location.Y<this.TailFLoor.FloorNum)
        {
            return;
        }
        this._SafeLocation = location;
        if(location.Y<=this.HeadFloor.FloorNum)
        {
            var floorNum = location.Y
            for(let index = 0;index<2;++index)
            {
                this.LoopDoFloorStep(floorNum+index,this,this.ClearFloor);
            }
        }
        
    }
    //清理层的负面道具
    ClearFloor(step:Step):void
    {
        var stepItem = step.StepItem;
        if(stepItem.IsDifficulty||stepItem.ItemType == ItemType.Vine)
        {
            step.PutItem(ItemType.Empty);
        }
    }
    get PanelUI():GameUI
    {
        return this._PanelUI;
    }
    set PanelUI(value:GameUI)
    {
        value.SetLeftTouch(this,()=>{this.InputCtrl.Input(!IsRight);})
        value.SetRightTouch(this,()=>{this.InputCtrl.Input(IsRight);});                       
        this._PanelUI = value;
    }
    
    get HeadFloor():MountLine
    {
        return this.MountLines[this._HeadFloorIdx];
    }
    get TailFLoor():MountLine
    {
        return this.MountLines[this._TailFLoorIdx];
    }
    get PlayerDistance():number
    {
        return Math.abs((this.Player.Position.z - this._StartPosition.z)/(GameManager.StepDistance/2));
    }

    Death():void
    {
        var ui:EndGameUI = APP.UIManager.Show<EndGameUI>(EndGameUI);
        ui.SetGameInfo(this.PlayerDistance,this._GoldNum);
        this.TimeUp();
    }
    //对外接口
    Start( ):void
    {
        this._Start();
    }
    //重新开始
    ReStart():void
    {
        this._StartComplete();
    }
    ShowInputInfo(info:string):void
    {
        this.PanelUI.ShowInputInfo(info);
    }
    //左右移动
    MoveStep( isRight:boolean )
    {
        //移动中不让输入
        if(this.Player.BaseCtrler.Time>0)
        {
            return;
        }
        //var buff = this.Buffer;
        //获取下一层的Step
        var step:Step = this.Player.CurStep;
        if(isRight)
        {
            step = step.RightParent;
        }else
        {
            step = step.LeftParent;
        }

        if(step == null||step.StepItem.IsForbiden)
        {
            return;
        }
        
        this.Player.LayStep(step);
        this.Player.BaseCtrler.StartMove();
    }
    
    /**
     * 根据层数获取某层
     * @param {number} floor 
     */
    GetFloorByFloor(floor:number)
    {
        var tailFloor:MountLine = this.TailFLoor;
        if(floor< tailFloor.FloorNum)
        {
            return null;
        }
        var floorID = (floor - tailFloor.FloorNum  + this._TailFLoorIdx)%this.MountLines.length;
        return this.MountLines[floorID];
    }

    LoopDoFloorStep( floor:number,Owner:any,callBack:(step:Step)=>void ):void
    {
        if(floor<this.TailFLoor.FloorNum||floor>this.HeadFloor.FloorNum)
        {
            return;
        }
        var floorLine:MountLine = this.GetFloorByFloor(floor);
        for(let idx=0;idx<floorLine.LogicLength;++idx)
        {
            var step = floorLine.GetStep(idx);
            callBack.call(Owner,step);
        }
    }

    /**
     * 通过坐标获取台阶
     * @param location 索引,层数
     */
    GetStepByLocation(location:MLocation):Step
    {
        var getStep:Step = this.GetFloorByFloor(location.Y).GetStep(location.X);
        return getStep;
    }

    get PlayerFloor( ):number
    {
        var floor:number = this._StartPosition.z - this.Player.LogicPosition.z;
        floor = Math.round(floor/(GameManager.StepDistance/2));
        return Math.abs(floor);
    }
    get PlayerFloorLine( ):MountLine
    {
        return this.GetFloorByFloor(this.PlayerFloor);
    }

    //内部功能
    private _HeadFloorIdx:number;
    private _TailFLoorIdx:number;
    private _CountTime:number;
    private _BootomFloor:number;
    private _StartPosition:Laya.Vector3;
    private _GameUpdate:()=>void;
    private _PanelUI:GameUI;
    private _GoldNum:number;
    private _LogicGoldNum:number;
    
    constructor()
    {
        super();
        this.Camera = null;  
        this.GameScene = null;
        this.MountLines = null;
        this.Player =null;
        this.InputCtrl = null;
        this.ItemLayout = null;
        this.CurLineRewards = null;
        this.CurLineBarriers = null;

        this._HeadFloorIdx = 0;
        this._TailFLoorIdx = 0;
        this._CountTime = 0;
        this._BootomFloor =0;
        this._StartPosition = new Laya.Vector3();
        this._PanelUI = null;
        
    }
    //创建相关放这 这里重新开始不会走
    protected _Start():void
    {
        /*
        //创建方向光
        var directionLight = new Laya.DirectionLight();
        this.SceneMgr.CurScene.PutObj(directionLight);
        directionLight.color = new Laya.Vector3(1, 1, 1);
        directionLight.direction = new Laya.Vector3(1, -1, 0);
*/
        this.Camera =new GameCamera();
        this.Camera.transform.localRotationEuler =new Laya.Vector3(-30,0,0);
        this.SceneMgr.CurScene.PutObj(this.Camera);

        this.MountLines = [];
        var maxLineNum = GameManager.MaxLineNum;
        for( var lineIdx:number = maxLineNum-1;lineIdx>=0;--lineIdx )
        {
            var newMountLine = new MountLine(lineIdx,lineIdx);
            this.SceneMgr.CurScene.PutObj(newMountLine);
            this.MountLines[lineIdx] = newMountLine;
        }
        //创建UI
        var dir:GameDirector = this;
        

        //创建玩家
        this.Player = new Player();
        this.SceneMgr.CurScene.PutObj(this.Player);

        //准备玩家死亡事件
        APP.MessageCenter.Regist(GameEvent.PlayerDeath,this.Death,this);
        super._Start();
    }

    //进入游戏的设置放这里 重新开始走这里
    protected _StartComplete()
    {
        this._SafeLocation = new MLocation(0,0);
        //重置物品
        this.ItemLayout = new ItemLayout()
        this.CurLineRewards = new Array<LineItemInfo>();
        this.CurLineBarriers = new Array<LineItemInfo>();
        var lines:MountLine[] = this.MountLines;
        //创建输入控制器
        this.InputCtrl = new NormGameInput(this);
        this._HeadFloorIdx = lines.length -1;
        this._TailFLoorIdx = 0;
        this.Player.Reset();
        for(var idx:number = 0;idx<lines.length;++idx)
        {
            var line:MountLine = this.MountLines[idx];
            line.SetLine(idx);
            if(idx>0)
                lines[idx-1].SetNextFloor(line);
            else
            {
                this.Player.SetStep(line.GetStep(Math.floor( line.LogicLength/2)));
                this._StartPosition = this.Player.LogicPosition.clone();
            }
            this._PutItemInLine(idx);
        }
        this.Camera.Reset(new Laya.Vector3(),new Laya.Vector3(this.Player.Position.x,GameManager.StepLength * 9,GameManager.StepLength * 8),this.Player);
        this._GoldNum = 0;
        this._LogicGoldNum = 0;

        super._StartComplete();
        this.PanelUI = APP.UIManager.Show(GameUI);
        this._CountTime = this.GameTime +6000;
        this._BootomFloor = 0;
        this._GameUpdate = this._StartCount;
    }

    protected _Update():void
    {
        if(this._GameUpdate!=null )
        {
            this._GameUpdate();
        }
        /*
        */
    }

    //正常运行时的每帧逻辑
    private _RunGameUpdate()
    {
        this.PanelUI.Distance = this.PlayerDistance;
        var flooVector:Laya.Vector3 = this.TailFLoor.Position;
        if(flooVector.z - this.Player.Position.z>3*GameManager.StepDistance/2)
        {
            this._PushFLoor();
        }
        if(this._CountTime < this.GameTime)
        {
            this._CountTime = this.GameTime+ 3000;
            this._DestroyLine(this._BootomFloor);
            this._BootomFloor += 1; 
        }
    }

    //开始倒计时期间的每帧逻辑
    private _StartCount()
    {
        var time:string =""
        var countTime:number = this._CountTime - this.GameTime;
        if(countTime>0)
            time+= Math.floor( countTime/1000);
        else
        {
            this._GameUpdate = this._RunGameUpdate;
            this._CountTime = this.GameTime + 3000;
        }
        this.PanelUI.SetCountTime(time);
    }
     
    //将层向上叠
    protected _PushFLoor()
    {
        var preHead:MountLine = this.HeadFloor;
        this._HeadFloorIdx =(this._HeadFloorIdx+1)%this.MountLines.length;
        this._TailFLoorIdx = (this._TailFLoorIdx +1)%this.MountLines.length;
        var Headfloor:number = preHead.FloorNum + 1;
        this.HeadFloor.SetLine(Headfloor);
        preHead.SetNextFloor(this.HeadFloor);
        
        this._PutItemInLine(Headfloor);   
        return true;
    }

    /**
     * 摆放物品
     * @param {number} floor 物品列表
     */
    protected _PutItemInLine(floor:number)
    {
        var safeCol :{[key:string] :Array<number>;} = {};
        if(floor >= this._SafeLocation.Y + GameManager.MaxLineNum)
        {
            safeCol = this._CountOpenList(floor);
        }else
        {
            //摆放前先计算该层通路情况 
            safeCol = {}
            safeCol["o"] = this._CountRoadInfo(floor);
        }
    
        if(floor <1)
        {
            return;
        }
        //获取该行要摆放的物品
        this._TakeItemList(floor)
        
        //标记一条绝对安全的路
        var safeIdxColl:{ [key: string]: number; } ={};
        for(var colKey in safeCol)
        {
            var list = safeCol[colKey];
            var safeIdx = list[Math.floor(Math.random()*list.length)];
            if(safeIdxColl[safeIdx]==undefined)
            {
                safeIdxColl[safeIdx] = 1;
            }
        }
        //把需要放道具的格子放入随机池
        var curFloor:MountLine = this.GetFloorByFloor(floor);
        var randomPool:Array<Step> = new Array();
        //把安全的格子暂时移出来
        var safeStepList:Array<Step> = new Array<Step>();
        for( var stepIdx:number = 0; stepIdx < curFloor.LogicLength;++stepIdx )
        {
            var getStep:Step = curFloor.GetStep(stepIdx);
            if(safeIdxColl[stepIdx]==undefined)
            {
                randomPool.push(getStep);
            }else
            {
                safeStepList.push(getStep);
            }
        }
        //放陷阱
        var barriersList:Array<LineItemInfo> = this.CurLineBarriers;
        if(floor<=this._SafeLocation.Y+1&&floor>=this._SafeLocation.Y)
        {
            for(let index:number = barriersList.length-1; index>-1;--index)
            {
                barriersList.shift();
            }
        }
        this._OrginizePutItem(barriersList,randomPool);
        
        //摆放道具
        for(var safeStepIdx:number = 0;safeIdx<safeStepList.length;++safeIdx)
        {
            randomPool.push(safeStepList[safeIdx]);
        }
        var rewardList = this.CurLineRewards;
        this._OrginizePutItem(rewardList,randomPool);
        //再次计算通路情况 
        this._CountLastFloorRoad(floor);
    }

    /**
     * 摆放物品
     * @param {Array<LineItemInfo>} itemList 物品列表
     * @param {Array<Step>} randomPool 台阶集合
     */
    _OrginizePutItem(itemList:Array<LineItemInfo>,randomPool:Array<Step>):void
    {
        for(var itemIdx:number = 0;itemIdx < itemList.length;++itemIdx)
        {
            var info:LineItemInfo = itemList[itemIdx];
            for(var difficultyNum:number = 0; difficultyNum<info.Number;)
            {
                if(randomPool.length<1)
                {
                    break;
                }
                //随机把障碍放入格子里
                var randomIdx:number = Math.floor(Math.random()*randomPool.length);
                var step:Step = randomPool[randomIdx];
                randomPool.splice(randomIdx,1);
                step.PutItem(info.Type);
                --info.Number;
            }
            if(randomPool.length<1)
            {
                break;
            }
        }
        if(itemIdx>0)
        {
            itemList.splice(0,itemIdx);       
        }
    }

    /**
     *递归计算通路情况
     * @param {number} floorNum 物品列表
     */
    _CountOpenList(floorNum:number):{[key:string] :Array<number>;}
    {
        for(var floorCount:number = this.PlayerFloor; floorCount<=floorNum;++floorCount)
        {
            var floor:MountLine = this.GetFloorByFloor(floorCount);
            if(floor == null)
                return;
            for(var stepIdx = 0;stepIdx<floor.LogicLength;++stepIdx)
            {
                var step = floor.GetStep(stepIdx);
                step.Mark = undefined;
            }
        }
        var floor:MountLine = this.GetFloorByFloor(this.PlayerFloor);
        for(var stepIdx = 0;stepIdx<floor.LogicLength;++stepIdx)
        {
            var step = floor.GetStep(stepIdx);
            if(!step.IsDeadRoad)
            {
                this._MarkSteps(step,stepIdx,floorNum);
            }
        }
        var targetFloor:MountLine = this.GetFloorByFloor(floorNum);
        //找出被标记的点并整理成集合
        var collection:{[key:string] :Array<number>;} = {}
        var name:string = "o"
        for(var openIdx:number = 0;openIdx<targetFloor.LogicLength; ++openIdx )
        {
            var markedStep:Step = targetFloor.GetStep(openIdx);
            if(markedStep.Mark!=undefined)
            {
                var Name:string = name + markedStep.Mark;
                if(collection[Name] == undefined)
                {
                    collection[Name] = new Array();
                }

                collection[Name].push(openIdx);
            }
        }
        return collection;
    }
    /**
     *递归标记通路情况
     * @param {Step} step 台阶
     * @param {any} mark 标记
     * @param {number} targetFloorNum 目标层数
     */
    _MarkSteps(step:Step,mark:any,targetFloorNum:number):boolean
    {
        if(step.IsDeadRoad)
            return false;
        if(step.Floor.FloorNum>=targetFloorNum )
        {
            if(step.Mark == undefined)
            {
                step.Mark = mark
            }
            return true;
        }
        var leftOpen:boolean;
        var rightOpen:boolean;
        var leftParent:Step = step.LeftParent;
        if(leftParent != null && !leftParent.IsDeadRoad)
        {
            if(leftParent.Mark==undefined)
                leftOpen = this._MarkSteps(leftParent,mark,targetFloorNum);
            else
                leftOpen = true;
        }
        var rightParent:Step = step.RightParent;
        if(rightParent != null && !rightParent.IsDeadRoad)
        {
            if(rightParent.Mark==undefined)
                rightOpen = this._MarkSteps(rightParent,mark,targetFloorNum);
            else
                rightOpen = true;
        }
        if(step.Mark == undefined)
        {
            step.Mark = mark
        }
        if(!leftOpen&&!rightOpen)
        {
            step.IsDeadRoad = true;
            return false;
        }else
        {
            return true;
        }
    }
    
    /**
     * 最后再计算一次该层通路情况
     * @param {number} floorNum 
     */
    _CountLastFloorRoad(floorNum:number):void
    {
        if(floorNum < this.TailFLoor.FloorNum)
        {
            return;
        }
        var floor = this.GetFloorByFloor(floorNum);
        var lastFloor = this.GetFloorByFloor(floorNum -1 );
        for(var stepIdx =0;stepIdx<floor.LogicLength;++stepIdx)
        {
            var step:Step = floor.GetStep(stepIdx);
            if(!step.IsDeadRoad)
            {
                var LeftStep = step.LeftChild;
                var RightStep = step.RightChild;
                if(LeftStep!=null)
                {
                    if(!LeftStep.IsDeadRoad)
                    {
                        ++LeftStep.RoadNum;
                    }
                }
                if(RightStep!=null)
                {
                    if(!RightStep.IsDeadRoad)
                    {
                        ++RightStep.RoadNum;
                    }
                }
            }
        }
        for(var lastStepIdx = 0;lastStepIdx< lastFloor.LogicLength;++lastStepIdx)
        {
            var step = lastFloor.GetStep(stepIdx);
            if(!step.IsDeadRoad&&step.RoadNum<1)
            {
                step.IsDeadRoad = true
                //向上递归把所有与之相连的节点数给修正了
            }
        }
    }

    /**
     * 放道具前算通路情况
     * @param {number} floor 
     */
    _CountRoadInfo(floor:number):Array<number>
    {
        var safeStepList:Array<number> = [];
        var thisFloor:MountLine = this.GetFloorByFloor(floor);
        
        var roadNum:number = 0;
        var lastFloor:MountLine = this.GetFloorByFloor(floor -1);
        for(var logicIdx:number = 0; logicIdx<thisFloor.LogicLength;++logicIdx)
        {
            var step:Step = thisFloor.GetStep(logicIdx);
            var leftChild:Step = step.LeftChild;
            var rightChild:Step = step.RightChild;
            if(leftChild!= null && !leftChild.IsDeadRoad)
            {
                safeStepList.push(logicIdx);
            }else if(rightChild!= null && !rightChild.IsDeadRoad)
            {
                safeStepList.push(logicIdx);
            }
            else
            {
                step.IsDeadRoad = true;
            }
        }
        if(floor == 0)
        {
            this.Player.CurStep.IsDeadRoad = false;
        }
        return safeStepList;
    }

    /**
     * 获取某道具信息
     * @param {number}floor 
     */
    _TakeItemList(floor:number)
    {
        var line = this.GetFloorByFloor(floor);
        var itemList = new Array(line.LogicLength);
        var lineRewards = this.ItemLayout.TakeLineReward(floor);
        this.CurLineRewards = this.CurLineRewards.concat(lineRewards);
        //if(this.TargetLocation.y>0&&( this.TargetLocation.y >=floor && this.TargetLocation.y<floor+3 ))
        //{
        //}else
        //{
            lineRewards = this.ItemLayout.TakeLineDifficulty(floor);
            this.CurLineBarriers = this.CurLineBarriers.concat(lineRewards);                  
        //}
        
    }
    /**
     * 塌陷某一层
     * @param {number}floor 
     */
    _DestroyLine(floor:number)
    {
        var tailFloor = this.TailFLoor;
        if(floor <tailFloor.FloorNum)
        {
            return;
        }
        for(var countFloor:number = tailFloor.FloorNum;countFloor<= floor;++countFloor)
        {
            var targetFloor:MountLine = this.GetFloorByFloor(countFloor);
            targetFloor.Break();
        }
        this.Player.TouchGround();
    }
}