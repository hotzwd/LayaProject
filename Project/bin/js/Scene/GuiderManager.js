var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GuiderManager = /** @class */ (function () {
    //内部功能
    function GuiderManager() {
        this.SceneMgr = SceneManager.Mgr;
    }
    Object.defineProperty(GuiderManager, "Mgr", {
        get: function () {
            if (GuiderManager._Mgr == null) {
                GuiderManager._Mgr = new GuiderManager();
            }
            return GuiderManager._Mgr;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GuiderManager.prototype, "GameDir", {
        get: function () {
            return this.CurScene.GuidDir;
        },
        enumerable: true,
        configurable: true
    });
    //进入游戏场景走这个接口
    GuiderManager.prototype.EnterScene = function () {
        var newGameScene = new GuiderScene();
        SceneManager.Mgr.EnterScene(newGameScene);
        this.CurScene = newGameScene;
    };
    return GuiderManager;
}());
var GuiderScene = /** @class */ (function (_super) {
    __extends(GuiderScene, _super);
    function GuiderScene() {
        return _super.call(this) || this;
    }
    GuiderScene.prototype.StartLoad = function () {
        Laya.loader.load([{ url: "res/uijson/ItemList.json", type: Laya.Loader.JSON }, { url: "res/uijson/EnterScene.json", type: Laya.Loader.JSON }, { url: "res/atlas/comp.atlas", type: Laya.Loader.ATLAS }], Laya.Handler.create(this, this._LoadComplete));
    };
    GuiderScene.prototype._GenDir = function () {
        this.GuidDir = new GuiderDirector();
        this.CurDir = this.GuidDir;
    };
    return GuiderScene;
}(BaseScene));
var GuiderDirector = /** @class */ (function (_super) {
    __extends(GuiderDirector, _super);
    function GuiderDirector() {
        return _super.call(this) || this;
    }
    GuiderDirector.prototype.ReStart = function () {
    };
    GuiderDirector.prototype._Start = function () {
        _super.prototype._Start.call(this);
    };
    GuiderDirector.prototype._StartComplete = function () {
        _super.prototype._StartComplete.call(this);
        this.UI = APP.UIManager.Show(EnterGameUI);
    };
    GuiderDirector.prototype._Update = function () {
    };
    return GuiderDirector;
}(BaseDirector));
//# sourceMappingURL=GuiderManager.js.map