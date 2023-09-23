import { EconItem, TradeOffer, UserDetails } from "@tf2autobot/tradeoffer-manager";
import Bot from "./classes/Bot";
import {ColorResolvable, EmbedBuilder} from 'discord.js'
import SteamID from "steamid";
import Currencies from "@tf2autobot/tf2-currencies";
import * as t from './lib/tools/export';
import SKU from '@tf2autobot/tf2-sku';

export default class Custom {

    constructor (private readonly bot: Bot) {
    }

    public sendAcceptedOfferMessage(offer: TradeOffer) {
        const summary = new OfferSummary(offer, this.bot);

        const embed = new EmbedBuilder()
            /* .setColor(summary.color)
            .setAuthor({
                name: summary.details.personaName,
                url: Utils.getProfile(summary.partner),
                iconURL: summary.details.avatarIcon
            }) */
            .setTitle(`Trade #${offer.id} has been accepted`)
            .addFields(
                {
                    name: "Purchased:",
                    value: summary.purchased
                },
                {
                    name: "Sold:",
                    value: summary.sold
                }/* ,
                {
                    name: "Profit:",
                    value: summary.profit.toString()
                },
                {
                    name: "Overpay:",
                    value: summary.overpay.toString()
                } */
            )
            // .setFooter({ text: `Stock: ${this.bot.tf2Manager.getPure().toString()}` });


            this.bot.discordBot.sendMessage(offer.partner.redirectAnswerTo, {embeds: [embed]});
    }
}

export class OfferSummary {
    
    readonly purchased: string;
    readonly sold: string;

    constructor(offer: TradeOffer, readonly bot: Bot) {
        this.purchased = this.getItemsString(offer.itemsToReceive);
        this.sold = this.getItemsString(offer.itemsToGive);
    }

    private getItemsString(items: EconItem[]): string {
        let amounts = new Map<string, number>();
        items.forEach(item => {
            const sku = item.getSKU(this.bot.schema, true, true, true, true, new String[0]).sku;
            if(amounts.get(sku) === undefined) {
                amounts.set(sku, 1);
            } else {
                amounts.set(sku, amounts.get(sku) + 1);
            }
        });

        let lines = [];
        for (const [sku, amount] of amounts) {
            lines.push(`\`${amount}x ${this.bot.schema.getName(SKU.fromString(sku), false)} (${sku}\``);
        }
        return lines.join("\n") + "** **";
    }
}