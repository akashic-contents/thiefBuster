import { asaEx } from "../util/asaEx";
import { audioUtil } from "../util/audioUtil";
import { entityUtil } from "../util/entityUtil";
import { gameUtil } from "../util/gameUtil";
import { spriteUtil } from "../util/spriteUtil";
import { AsaInfo } from "./asaInfo";
import { AssetInfo } from "./assetInfo";
import { define } from "./define";
import { SoundInfo } from "./soundInfo";
import { TimerLabel } from "./timerLabel";
import { Workman } from "./workman";
import { Bullet } from "./bullet";
import { Item } from "./item";
import { Thief } from "./thief";
import { Score } from "./score";
import { Combo } from "./combo";
import { PopScore } from "./popScore";
import { GameParameterReader } from "./gameParameterReader";
import { SpriteFrameMap } from "../util/spriteSheetTypes";
import { GameBase } from "../commonNicowariGame/gameBase";
import { CommonParameterReader } from "../commonNicowariGame/commonParameterReader";

/**
 * ゲームの実体を実装するクラス
 */
export class ThiefBuster extends GameBase {
	/** ゲーム中フラグ */
	private inGame: boolean;
	/** 残り時間表示ラベル */
	private timerLabel: TimerLabel;
	/** ビル、ドア、ワークマン レイヤー */
	private layerBuilding: g.E;
	/** 泥棒レイヤー */
	private layerThief: g.E;
	/** 弾レイヤー */
	private layerBullet: g.E;
	/** アイテムレイヤー */
	private layerItem: g.E;
	/** ワークマン */
	private wkman: Workman;
	/** 弾 */
	private bullets: Bullet[] = [];
	/** アイテム */
	private item: Item;
	/** 泥棒たち */
	private thieves: Thief[] = [];
	/** ドア3枚 */
	private doors: asaEx.Actor[] = [];
	/** スコア */
	private score: Score;
	/** コンボ */
	private combo: Combo;
	/** ポップするスコア */
	private popScore: PopScore;
	/** 泥棒出現段階 */
	private popPhase: number = 0;
	/** ゲーム開始からのフレーム用カウンタ */
	private cntGame: number = 0;
	/** アイテム出現用カウンタ */
	private cntItemPop: number = 0;
	/** 前フレームのレベル記憶 */
	private beforeLevel: define.BulletLevel;
	/** Interval解除用 */
	private retTimeIdentifier: g.TimerIdentifier;
	/** フェイズごとの泥棒出現インデックスカウンタ */
	private cntPopIndexOnPhase: number = 0;

	/**
	 * 継承元のコンストラクタをよぶ
	 * @param  {g.Scene} _scene シーン
	 */
	constructor(_scene: g.Scene) {
		super(_scene);
	}

	/**
	 * このクラスで使用するオブジェクトを生成するメソッド
	 * Scene#loadedを起点とする処理からコンストラクタの直後に呼ばれる。
	 * このクラスはゲーム画面終了時も破棄されず、次のゲームで再利用される。
	 * そのためゲーム状態の初期化はinitではなくshowContentで行う必要がある。
	 * @override
	 */
	init(): void {
		super.init();

		const scene = this.scene;
		const game = scene.game;
		const spoUi = spriteUtil.createSpriteParameter(AssetInfo.ui);
		const sfmUi = spriteUtil.createSpriteFrameMap(AssetInfo.ui);

		const charCode0: number = 48;
		const charCode10: number = 58;

		GameParameterReader.read(scene);

		// 白数字
		const fontStgNum1: g.BitmapFont = gameUtil.createNumFontWithAssetInfo(
			AssetInfo.numWhite
		);

		// 赤数字
		const imgStgNum2: g.Asset = this.scene.assets[AssetInfo.numRed.img];
		const jsonStgNum2: SpriteFrameMap = JSON.parse(
			(<g.TextAsset>this.scene.assets[AssetInfo.numRed.json]).data
		);
		const stgNum2FrameNames: string[] = AssetInfo.numRed.numFrames;
		const fontmapStgNum2: { [key: string]: g.GlyphArea } = gameUtil.makeGlyphMapFromFrames(
			charCode0,
			charCode10,
			jsonStgNum2,
			stgNum2FrameNames
		);
		gameUtil.addOneGlyphMapFromFrame(
			"+",
			jsonStgNum2,
			AssetInfo.numRed.frames.plus,
			fontmapStgNum2
		);
		const stgNum2W: number = AssetInfo.numRed.fontWidth;
		const stgNum2H: number = AssetInfo.numRed.fontHeight;
		const fontStgNum2: g.BitmapFont = new g.BitmapFont(
			imgStgNum2,
			fontmapStgNum2,
			stgNum2W,
			stgNum2H,
			fontmapStgNum2[charCode0]
		);
		game.vars.scenedata.fontStgNum2 = fontStgNum2;

		// 青数字
		const imgStgNum3: g.Asset = this.scene.assets[AssetInfo.numBlue.img];
		const jsonStgNum3: SpriteFrameMap = JSON.parse(
			(<g.TextAsset>this.scene.assets[AssetInfo.numBlue.json]).data
		);
		const stgNum3FrameNames: string[] = AssetInfo.numBlue.numFrames;
		const fontmapStgNum3: { [key: string]: g.GlyphArea } = gameUtil.makeGlyphMapFromFrames(
			charCode0,
			charCode10,
			jsonStgNum3,
			stgNum3FrameNames
		);
		gameUtil.addOneGlyphMapFromFrame(
			"-",
			jsonStgNum3,
			AssetInfo.numBlue.frames.minus,
			fontmapStgNum3
		);
		const stgNum3W: number = AssetInfo.numBlue.fontWidth;
		const stgNum3H: number = AssetInfo.numBlue.fontHeight;
		const fontStgNum3: g.BitmapFont = new g.BitmapFont(
			imgStgNum3,
			fontmapStgNum3,
			stgNum3W,
			stgNum3H,
			fontmapStgNum2[charCode0]
		);
		game.vars.scenedata.fontStgNum3 = fontStgNum3;

		// レイヤー
		this.layerBuilding = new g.E({ scene: scene });
		this.layerThief = new g.E({ scene: scene });
		this.layerBullet = new g.E({ scene: scene });
		this.layerItem = new g.E({ scene: scene });
		entityUtil.appendEntity(this.layerBuilding, this);
		entityUtil.appendEntity(this.layerThief, this);
		entityUtil.appendEntity(this.layerBullet, this);
		entityUtil.appendEntity(this.layerItem, this);

		// タイマー
		const iconT = spriteUtil.createFrameSprite(
			spoUi,
			sfmUi,
			AssetInfo.ui.frames.iconT
		);
		iconT.moveTo(define.ICON_T_X, define.ICON_T_Y);
		entityUtil.appendEntity(iconT, this.layerItem);
		const timer = this.timerLabel = new TimerLabel(this.scene);
		timer.createLabel(AssetInfo.numWhite, AssetInfo.numRed);
		timer.moveLabelTo(define.GAME_TIMER_X, define.GAME_TIMER_Y);
		entityUtil.appendEntity(timer, this.layerItem);

		const spoStage = spriteUtil.createSpriteParameter(AssetInfo.stage);
		const sfmStage = spriteUtil.createSpriteFrameMap(AssetInfo.stage);
		const stageBG = spriteUtil.createFrameSprite(
			spoStage,
			sfmStage,
			AssetInfo.stage.frames.bg
		);
		stageBG.moveTo(define.POS_STAGE_BG);
		entityUtil.appendEntity(stageBG, this.layerBuilding);

		// ステージ背景とステージメインの間
		this.wkman = new Workman(scene, this.layerBuilding);

		const stage = spriteUtil.createFrameSprite(
			spoStage,
			sfmStage,
			AssetInfo.stage.frames.building
		);
		stage.moveTo(define.POS_STAGE);
		entityUtil.appendEntity(stage, this.layerBuilding);

		const stageSide = spriteUtil.createFrameSprite(
			spoStage,
			sfmStage,
			AssetInfo.stage.frames.buildingSide
		);
		stageSide.moveTo(define.POS_STAGE_SIDE);
		entityUtil.appendEntity(stageSide, this.layerItem); // 泥棒より手前

		// スコア
		const iconPt = spriteUtil.createFrameSprite(
			spoUi,
			sfmUi,
			AssetInfo.ui.frames.iconPt
		);
		iconPt.moveTo(define.ICON_PT_X, define.ICON_PT_Y);
		entityUtil.appendEntity(iconPt, this.layerItem);
		this.score = new Score(this.scene);
		entityUtil.appendEntity(this.score, this.layerItem);
		this.score.createScoreLabel(
			fontStgNum1,
			define.GAME_SCORE_DIGIT,
			{ x: define.GAME_SCORE_X, y: define.GAME_SCORE_Y }
		);

		this.combo = new Combo(
			this.scene,
			this.layerItem,
			gameUtil.createNumFontWithAssetInfo(AssetInfo.numCb),
			AsaInfo.combo.pj,
			AsaInfo.combo.anim.combo,
			define.POS_COMBO,
			define.COMBO_DIGIT,
			define.COMBO_DIVISOR,
			define.COMBO_PIVOT
		);

		this.popScore = new PopScore(
			this.scene,
			this.layerItem,
			fontStgNum2,
			fontStgNum3,
			AsaInfo.scorePopPoint.pj,
			AsaInfo.scorePopPoint.anim.plus,
			AsaInfo.scorePopPoint.anim.minus,
			define.POS_POINT_OFFSET_Y_1,
			define.POS_POINT_OFFSET_Y_2,
			define.POP_SCORE_PIVOT,
			define.POP_SCORE_DIGIT
		);

		for (let i = 0; i < 3; ++i) { // ドア生成
			this.doors.push(this.createDoor(i));
		}
		this.item = new Item(this.scene, this.layerItem);
	}

	/**
	 * 表示系以外のオブジェクトをdestroyするメソッド
	 * 表示系のオブジェクトはg.Eのdestroyに任せる。
	 * @override
	 */
	destroy(): void {
		super.destroy();
	}

	/**
	 * タイトル画面のBGMのアセット名を返すメソッド
	 * 共通フロー側でBGMを鳴らさない場合は実装クラスでオーバーライドして
	 * 空文字列を返すようにする
	 * @return {string} アセット名
	 * @override
	 */
	getTitleBgmName(): string {
		return SoundInfo.bgmSet.title;
	}

	/**
	 * ゲーム中のBGMのアセット名を返すメソッド
	 * 共通フロー側でBGMを鳴らさない場合は実装クラスでオーバーライドして
	 * 空文字列を返すようにする
	 * @return {string} アセット名
	 * @override
	 */
	getMainBgmName(): string {
		return SoundInfo.bgmSet.main;
	}

	/**
	 * 表示を開始するメソッド
	 * ゲーム画面に遷移するワイプ演出で表示が始まる時点で呼ばれる。
	 * @override
	 */
	showContent(): void {
		this.inGame = false;
		let timeLimit = define.GAME_TIME;
		if (CommonParameterReader.useGameTimeLimit) {
			timeLimit = CommonParameterReader.gameTimeLimit;
			if (timeLimit > define.GAME_TIME_MAX) {
				timeLimit = define.GAME_TIME_MAX;
			}
		}
		this.timerLabel.setTimeCount(timeLimit);
		this.timerLabel.timeCaution.handle(this, this.onTimeCaution);
		this.timerLabel.timeCautionCancel.handle(this, this.onTimeCautionCancel);

		this.wkman.init();
		this.item.init();
		for (let i = 0; i < this.thieves.length; ++i) { // 泥棒ループ
			this.thieves[i].destroy();
		}
		this.thieves = [];
		for (let i = 0; i < this.doors.length; ++i) { // ドアループ
			this.doors[i].play(AsaInfo.door.anim.main, 0, false, 1.0); // ドア閉
			this.doors[i].pause = true;
		}
		this.score.init();
		this.combo.init();

		this.cntGame = 0;
		this.cntItemPop = 0;
		this.popPhase = 0;

		// 各フェイズの泥棒出現テーブルのランダムソート
		for (let i = 0; i < GameParameterReader.thiefPopRates.length; ++i) {
			this.sortArrayRandom(GameParameterReader.thiefPopRates[i].list);
		}

		super.showContent();
	}

	/**
	 * ゲームを開始するメソッド
	 * ReadyGo演出が完了した時点で呼ばれる。
	 * @override
	 */
	startGame(): void {
		this.inGame = true;
		this.scene.pointDownCapture.handle(this, this.onTouch);

		const len: number = GameParameterReader.thiefPopRates.length;
		this.retTimeIdentifier = this.scene.setInterval(
			(this.timerLabel.getTimeCount() * 1000) / len, // ゲーム制限時間のフェーズ数分の1ごと
			this, // owner
			(): void => {
				if (this.popPhase < GameParameterReader.thiefPopRates.length - 1) {
					this.popPhase += 1;
					this.cntPopIndexOnPhase = 0;
					// console.log("sec" + this.timerLabel.getTimeCount() + " popPhase：" + (this.popPhase + 1));
					// console.table(define.THIEF_POP_RATES[this.popPhase].list);
				}
			}
		);
	}

	/**
	 * 表示を終了するメソッド
	 * このサブシーンから遷移するワイプ演出で表示が終わる時点で呼ばれる。
	 * @override
	 */
	hideContent(): void {
		this.timerLabel.timeCaution.removeAll(this);
		this.timerLabel.timeCautionCancel.removeAll(this);
		super.hideContent();
	}

	/**
	 * Scene#updateを起点とする処理から呼ばれるメソッド
	 * ゲーム画面でない期間には呼ばれない。
	 * @override
	 */
	onUpdate(): void {
		if (this.inGame) {
			this.timerLabel.tick();
			if (this.timerLabel.getTimeCount() === 0) {
				this.finishGame();
				return; // ゲーム終了時は以降の処理を飛ばす
			}

			// 泥棒出現処理
			this.popThiefController();

			// アイテム出現処理
			this.popItemController();

			this.wkman.update();
			this.score.onUpdate();

			// 弾ループ
			for (let i = 0; i < this.bullets.length; ++i) {
				const bul: Bullet = this.bullets[i]; // 短縮
				const bulArea: g.CommonArea = bul.getCollArea();
				// 画面外に出たら
				if (bulArea.x > (this.scene.game.width - define.OFFSET_X)) {
					bul.destroySpr(); // 弾の削除
					continue; // 次の弾へ
				}
				// アイテムに当たったら
				this.collWithItem(bulArea);
				// 泥棒に当たったら
				this.collWithThief(bul);

			} // end 弾ループ

			// 泥棒逃亡
			for (let i = 0; i < this.thieves.length; ++i) { // 泥棒ループ
				const thief: Thief = this.thieves[i]; // 短縮

				if (thief.isDead()) { // 倒していたら処理しない＝ダウンアニメ中
					continue;
				}
				// ドアとの判定
				this.collWithDoor(thief);

			} // end泥棒ループ

			// ドアクローズ音
			this.playCloseDoorSE();

			// 削除された弾を配列から取り除く
			this.spliceDestroyedBullet();

			// 削除された泥棒を配列から取り除く
			this.spliceDestroyedThief();

		} // end if (this.inGame)
	}
	/**
	 * ゲームスタート前の説明
	 * @return {boolean} trueで有効
	 * @override
	 */
	startPreGameGuide(): boolean {
		return false;
	}
	/**
	 * ゲームスタート前の説明中の更新処理
	 * @return {boolean} trueで終了
	 * @override
	 */
	onUpdatePreGameGuide(): boolean {
		return true;
	}

	/**
	 * TimerLabel#timeCautionのハンドラ
	 */
	private onTimeCaution(): void {
		this.timeCaution.fire();
	}

	/**
	 * TimerLabel#timeCautionCancelのハンドラ
	 */
	private onTimeCautionCancel(): void {
		this.timeCautionCancel.fire();
	}

	/**
	 * ゲームを終了するメソッド
	 * gameUtil.setGameScoreしたスコアが結果画面で表示される。
	 * @param {boolean = false} opt_isLifeZero
	 * (optional)ライフ消滅によるゲーム終了の場合はtrue
	 */
	private finishGame(opt_isLifeZero: boolean = false): void {
		this.inGame = false;
		this.scene.pointDownCapture.removeAll(this);
		this.scene.clearInterval(this.retTimeIdentifier);

		for (let i = 0; i < this.thieves.length; ++i) { // 泥棒ループ
			this.thieves[i].setMoveX(); // 画面上の泥棒の移動をストップ
		}
		this.score.onFinishGame();
		const resultScore: number = this.score.getValue();
		// マイナスの場合があるので明示的に0
		gameUtil.setGameScore(resultScore < 0 ? 0 : resultScore);

		// 呼び出すトリガーによって共通フローのジングルアニメが変化する
		if (opt_isLifeZero) {
			this.gameOver.fire();
			this.timerLabel.forceStopBlink();
		} else {
			this.timeup.fire();
		}
	}

	/**
	 * Scene#pointDownCaptureのハンドラ
	 * @param  {g.PointDownEvent} _e イベントパラメータ
	 * @return {boolean}             ゲーム終了時はtrueを返す
	 */
	private onTouch(_e: g.PointDownEvent): boolean {
		if (!this.inGame) {
			return true;
		}

		if (!this.wkman.isAttack()) { // 攻撃中じゃない
			audioUtil.play(SoundInfo.seSet.attack);
			this.wkman.pointDown(); // 腕ふり
			const level: define.BulletLevel = this.wkman.getLevel(); // ワークマン現在レベル
			const atkPos: g.CommonOffset = this.wkman.getAttackPosition(); // 腕ふり場所
			// 弾の生成と配列への追加
			this.bullets.push(
				new Bullet(this.scene, this.layerBullet, level, atkPos)
			);
		}

		return false;
	}

	/**
	 * ドアの作成
	 * @param  {number}      _index 階層
	 * @return {asaEx.Actor}        ドアActor
	 */
	private createDoor(_index: number): asaEx.Actor {
		const doorActor: asaEx.Actor = new asaEx.Actor(
			this.scene,
			AsaInfo.door.pj,
			AsaInfo.door.anim.main
		);
		doorActor.width = define.DOOR_WIDTH;
		doorActor.moveTo(
			define.POS_DOOR.x,
			define.POS_DOOR.y + (_index * define.FLOOR_HEIGHT) // 各階層の高さ
		);
		entityUtil.appendEntity(doorActor, this.layerBuilding);
		doorActor.play(AsaInfo.door.anim.main, 0, false, 1.0);
		doorActor.pause = true;
		doorActor.update.handle(doorActor, (): boolean => {
			doorActor.modified();
			doorActor.calc();
			return false;
		});
		return doorActor;
	}

	/**
	 * 一次元配列のランダムソート
	 * @param {number[]} _ary 配列
	 */
	private sortArrayRandom(_ary: number[]): void {
		if (!Array.isArray(_ary)) {
			return;
		}
		let len: number = _ary.length - 1;
		while (len) {
			const randWk: number = this.scene.game.random[0].get(0, len);
			const wk: number = _ary[len];
			_ary[len] = _ary[randWk];
			_ary[randWk] = wk;
			len -= 1;
		}
	}

	/**
	 * 泥棒出現管理
	 */
	private popThiefController(): void {
		const info: define.ThiefPopInterface = GameParameterReader.thiefPopRates[this.popPhase];
		if (this.cntGame === 0 ||
			this.cntGame % info.popInterval === 0) { // 段階ごとの泥棒出現フレーム
			let retIndex: number = define.ThiefType.short;
			// フェイズごとのランダムソートされた泥棒リストから選択
			retIndex = info.list[this.cntPopIndexOnPhase];
			// フェイズごとのインデックスを進める
			++this.cntPopIndexOnPhase;
			if (this.cntPopIndexOnPhase >= info.list.length) {
				this.cntPopIndexOnPhase = 0;
			}
			// 選択した泥棒の出現高さを取得
			const floorIndex = this.findOfFloor(info.floor, retIndex);
			this.sortArrayRandom(info.floor[floorIndex].value);
			// 泥棒の生成と配列への追加
			this.thieves.push(
				new Thief(
					this.scene,
					this.layerThief,
					retIndex,
					info.floor[floorIndex].value[0] // ランダムソート後の1番目
				)
			);
		}
		++this.cntGame;
	}

	/**
	 * 指定配列の中からtype値が一致する要素があるindex番号を返す
	 * @param  {define.PopFloorInterface[]} _ary  配列
	 * @param  {number}                     _type 種別
	 * @return {number}                           該当Index
	 */
	private findOfFloor(_ary: define.PopFloorInterface[], _type: number): number {
		for (let i = 0; i < _ary.length; ++i) {
			if (_ary[i].type === _type) {
				return i;
			}
		}
		return 0;
	}

	/**
	 * アイテム出現管理
	 */
	private popItemController(): void {
		if (this.beforeLevel !== this.wkman.getLevel()) { // アイテムとったなら
			this.cntItemPop = 0; // 再計測開始
		}
		++this.cntItemPop;
		// アイテムとるまでは休みなく出す
		if (this.cntItemPop > this.scene.game.fps * GameParameterReader.itemPopInterval) {
			this.item.popItem(this.wkman.getLevel()); // アイテムの出現
		}
		this.beforeLevel = this.wkman.getLevel(); // レベルの記憶
	}

	/**
	 * 弾と泥棒との衝突
	 * @param {Bullet} _bul 弾
	 */
	private collWithThief(_bul: Bullet): void {
		const bulArea: g.CommonArea = _bul.getCollArea();
		for (let i = 0; i < this.thieves.length; ++i) { // 泥棒ループ
			const thief: Thief = this.thieves[i]; // 短縮
			const thiefArea: g.CommonArea = thief.getCollArea(); // 当たり判定エリア取得
			let plusScore: number = 0;
			// 弾と泥棒との当たり判定
			if (thief.checkCollisionStat() && // 当たり判定可能状態かつ
				g.Collision.intersectAreas(bulArea, thiefArea)) { // 当たってる
				// 泥棒のlife削る、泥棒の絶命時は自身の得点を返す
				plusScore = thief.minusLife();
				_bul.minusLife(); // 弾のlife削る
				if (plusScore !== 0) { // 0じゃないのは倒した証拠
					_bul.addKill(); // 弾ごとのキルカウント
					thief.deathCry(_bul.getKill()); // 断末魔の叫び
					// コンボなどのエフェクト作成と最終的なスコア計算
					const comboValue: number = this.combo.getComboValue(plusScore);
					this.combo.playComboAnim();
					this.popScore.createPopScore(thief.getPosition(), comboValue);
					this.score.startPlus(comboValue); // スコア加算開始
				}
			}
			if (_bul.checkSprDestroyed()) { // 弾消滅したら
				break; // 泥棒との当たり判定ループ抜ける
			}
		}
	}

	/**
	 * 弾とアイテムとの衝突処理
	 * @param {g.CommonArea} _bulArea 弾の領域
	 */
	private collWithItem(_bulArea: g.CommonArea): void {
		const item: Item = this.item; // 短縮
		const itemArea: g.CommonArea = item.getCollArea();
		if (item.checkCollisionStat() && // 当たり判定可能状態かつ
			g.Collision.intersectAreas(_bulArea, itemArea)) { // 当たってる
			item.setAnimeGet(); // アニメをゲットに
			this.wkman.plusLevel(); // レベルアップ
		}
	}

	/**
	 * 泥棒とドアとの衝突処理
	 * @param {Thief} _thief 泥棒
	 */
	private collWithDoor(_thief: Thief): void {
		const thiefPos: g.CommonOffset = _thief.getPosition();
		const indexY: number = _thief.getIndexPosY();
		const door: asaEx.Actor = this.doors[indexY];
		// ドア位置に達したら
		if (thiefPos.x < define.POS_DOOR.x + (door.width / 2) + 10) {
			if (!_thief.isStopDoor()) { // まだ立ち止まりフラグ立ってない
				_thief.setAnime(_thief.getAnimeTypes().in); // ドアに入るアニメに
			} else { // ドア前で佇んでいる状態
				if (_thief.isInDoor()) { // ドア入ったら。 1回だけ通る想定
					audioUtil.play(SoundInfo.seSet.open); // ドアオープン音
					// ドア開閉アニメスタート
					door.play(AsaInfo.door.anim.main, 0, false, 0.7);
					// マイナスエフェクト作成
					const minusValue: number = this.combo.getComboValue(define.SCORE_MINUS);
					this.combo.playComboAnim();
					this.popScore.createPopScore(thiefPos, minusValue);
					this.score.startPlus(minusValue); // スコア減算開始
					_thief.setFlgInDoor(false); // この条件にまた入らないようにset
				}
			}
		}
	}

	/**
	 * ドア閉じる音鳴らす
	 */
	private playCloseDoorSE(): void {
		for (let i = 0; i < this.doors.length; ++i) { // ドアループ
			// アニメ終わったら
			if (this.doors[i].currentFrame >= this.doors[i].animation.frameCount - 1) {
				audioUtil.play(SoundInfo.seSet.close);
				this.doors[i].play(AsaInfo.door.anim.main, 0, false, 1.0); // ドア開閉
				this.doors[i].pause = true;
			}
		}
	}

	/**
	 * 使命を終えた弾を配列から除去
	 */
	private spliceDestroyedBullet(): void {
		// 途中で取り除く可能性があるので最大値からマイナスループ
		for (let i = this.bullets.length - 1; i >= 0; --i) {
			if (this.bullets[i].checkSprDestroyed()) {
				this.bullets.splice(i, 1); // 配列から要素取り除き
			}
		}
	}
	/**
	 * 使命を終えた泥棒を配列から除去
	 */
	private spliceDestroyedThief(): void {
		// 途中で取り除く可能性があるので最大値からマイナスループ
		for (let i = this.thieves.length - 1; i >= 0; --i) {
			if (this.thieves[i].checkSprDestroyed()) {
				this.thieves.splice(i, 1); // 配列から要素取り除き
			}
		}
	}

}
