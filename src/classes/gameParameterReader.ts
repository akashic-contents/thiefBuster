import { GameParameters } from "./gameParameters";
import { CommonParameterReader } from "../commonNicowariGame/commonParameterReader";
import { DifficultyParametersJson, DifficultyParameter } from "./difficultyParameters";
import { define } from "./define";
import { MiscAssetInfo } from "./miscAssetInfo";

/**
 * ゲーム固有パラメータの読み込みクラス
 * 省略されたパラメータ項目の補完などを行う
 */
export class GameParameterReader {
	/** GameParameters.itemPopInterval に相当する値 */
	static itemPopInterval: number;
	/** GameParameters.startItemLevel に相当する値 */
	static startItemLevel: number;
	/** GameParameters.thiefPopRates に相当する値 */
	static thiefPopRates: define.ThiefPopInterface[];

	/**
	 * 起動パラメータから対応するメンバ変数を設定する
	 * @param {g.Scene} _scene Sceneインスタンス
	 */
	static read(_scene: g.Scene): void {
		// 規定の出現間隔を割り当てる
		this.itemPopInterval = define.ITEM_POP_INTERVAL;
		// 規定のスタート時アイテムを割り当てる
		this.startItemLevel = define.BulletLevel.nail;
		// 規定の敵データを割り当てる
		this.thiefPopRates = define.THIEF_POP_RATES;

		if (!CommonParameterReader.nicowari) {
			if (CommonParameterReader.useDifficulty) {
				// 難易度指定によるパラメータを設定
				this.loadFromJson(_scene);
			} else {
				const param: GameParameters = _scene.game.vars.parameters;
				if (typeof param.itemPopInterval === "number") {
					this.itemPopInterval = param.itemPopInterval;
				}
				if (typeof param.startItemLevel === "number") {
					this.startItemLevel = param.startItemLevel;
				}
				if (param.thiefPopRates) {
					this.thiefPopRates = <define.ThiefPopInterface[]>(param.thiefPopRates);
				}
			}
		}
	}

	/**
	 * JSONから難易度指定によるパラメータを設定
	 * @param {g.Scene} _scene Sceneインスタンス
	 */
	private static loadFromJson(_scene: g.Scene): void {
		const difficultyJson: DifficultyParametersJson
			= JSON.parse((<g.TextAsset>_scene
				.assets[MiscAssetInfo.difficultyData.name]).data);
		const difficultyList: DifficultyParameter[]
			= difficultyJson.difficultyParameterList;
		if (difficultyList.length === 0) {
			return;
		}
		let index = 0;
		for (let i = difficultyList.length - 1; i >= 0; --i) {
			if (difficultyList[i].minimumDifficulty
				<= CommonParameterReader.difficulty) {
				index = i;
				break;
			}
		}
		if (typeof difficultyList[index].itemPopInterval === "number") {
			this.itemPopInterval = difficultyList[index].itemPopInterval;
		}
		if (typeof difficultyList[index].startItemLevel === "number") {
			this.startItemLevel = difficultyList[index].startItemLevel;
		}
		if (difficultyList[index].embedNumber) {
			this.thiefPopRates = [];
			const length = difficultyList[index].embedNumber.length;
			for (let i = 0; i < length; ++i) {
				const phase = difficultyList[index].embedNumber[i];
				this.thiefPopRates[i] = define.THIEF_POP_RATES[phase - 1];
			}
		}
	}
}
