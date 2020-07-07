// ==UserScript==
// @name         Instacart Item Price-per-Unit
// @namespace    io.maddison.instacart-ppu
// @version      0.1
// @description  Displays the price per unit for Instacart items. Units are normalized to pounds/gallons.
// @author       Maddison Hellstrom
// @match        https://sameday.costco.com/*
// @match        https://*.instacart.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const convert = (units, amount) => {
        switch(units) {
            case "oz":
                return ["lb", amount / 16]
            case "l":
                return ["gal", amount * 0.2642]
            case "ml":
                return ["gal", amount * 0.0002642]
            case "fl oz":
                return ["gal", amount * 0.0078125]
            default:
                return [units, amount]
        }
    }

    const addPPU = () => document.querySelectorAll('.item-info:not(.has-ppu):not(#itemInfo-undefined)').forEach(e => {
        try {
            const e_size = e.querySelector(".item-size > span:first-child")
            const e_price = e.querySelector(".item-price")
            if (!e_size || !e_price) return

            const price = parseFloat(e_price.textContent.match(/(\d|\.)+/)[0])

            let count = e_size.textContent.match(/(\d+) x/)
            count = count ? parseInt(count[1]) : 1

            const size_frac = e_size.textContent.match(/[0-9./]+/g).pop()
            let [size_num, size_den] = size_frac.split('/')
            size_den = size_den ? size_den : 1
            size_num = parseFloat(size_num)
            size_den = parseFloat(size_den)
            const size = size_num / size_den
            const size_units = e_size.textContent.match(/(((?!\b(bag|box|container|pack|package|can|bottle|box|case|roll)\b)[a-wy-z]{0,}[a-rt-wy-z] ?)+)/i)[0].trim()

            const amount = count * size
            const [conv_units, conv_amount] = convert(size_units, amount)

            const ppu = price / conv_amount

            const ppu_text = `$${ppu.toFixed(2)}/${conv_units}`
            const amount_text = ` (${conv_amount.toFixed(2)} ${conv_units})`

            let e_ppu = e.querySelector('.item-ppu')
            if (!e_ppu) {
                e_ppu = document.createElement('div')
                e_ppu.classList += 'item-ppu'
                e.querySelector('.item-info > .item-row').append(e_ppu)
            }
            e_ppu.textContent = ppu_text

            if (size_den !== 1 || count !== 1 || size_units !== conv_units) {
                let e_amount = e.querySelector('.item-amount')
                if (!e_amount) {
                    e_amount = document.createElement('span')
                    e_amount.classList += 'item-amount'
                    e.querySelector('.item-size').append(e_amount)
                }
                e_amount.textContent = amount_text
            }

            e.classList += 'has-ppu'

            console.log({ price, count, size_frac, size_num, size_den, size, size_units, amount, conv_units, conv_amount, ppu, ppu_text, amount_text })
        } catch(e) {}
    })

    setInterval(addPPU, 1000)
})();
