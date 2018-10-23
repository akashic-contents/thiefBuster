import { RireGameParameters } from "../commonNicowariGame/rireGameParameters";
import { define } from "./define";

/**
 * 泥棒バスターのパラメータ
 */
export interface GameParameters extends RireGameParameters {
	/**
	 * アイテムの出現間隔を指定出来る。
	 */
	itemPopInterval?: number;
	/**
	 * スタート時のアイテムを指定出来る。
	 */
	startItemLevel?: number;
	/**
	 * この値が指定されると、敵をどういったパターンで出すかを指定出来る。
	 */
	thiefPopRates?: define.ThiefPopInterface[];
}
