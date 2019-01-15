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
var View = laya.ui.View;
var Dialog = laya.ui.Dialog;
var ui;
(function (ui) {
    var EnterSceneUI = /** @class */ (function (_super) {
        __extends(EnterSceneUI, _super);
        function EnterSceneUI() {
            return _super.call(this) || this;
        }
        EnterSceneUI.prototype.createChildren = function () {
            _super.prototype.createChildren.call(this);
            this.loadUI("EnterScene");
        };
        return EnterSceneUI;
    }(View));
    ui.EnterSceneUI = EnterSceneUI;
})(ui || (ui = {}));
(function (ui) {
    var GameSceneUI = /** @class */ (function (_super) {
        __extends(GameSceneUI, _super);
        function GameSceneUI() {
            return _super.call(this) || this;
        }
        GameSceneUI.prototype.createChildren = function () {
            _super.prototype.createChildren.call(this);
            this.loadUI("GameScene");
        };
        return GameSceneUI;
    }(View));
    ui.GameSceneUI = GameSceneUI;
})(ui || (ui = {}));
(function (ui) {
    var LoadingUI = /** @class */ (function (_super) {
        __extends(LoadingUI, _super);
        function LoadingUI() {
            return _super.call(this) || this;
        }
        LoadingUI.prototype.createChildren = function () {
            _super.prototype.createChildren.call(this);
            this.loadUI("Loading");
        };
        return LoadingUI;
    }(View));
    ui.LoadingUI = LoadingUI;
})(ui || (ui = {}));
//# sourceMappingURL=layaUI.max.all.js.map