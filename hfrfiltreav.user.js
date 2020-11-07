// ==UserScript==
// @name        [HFR] Filtre A&V
// @namespace   ddst.github.io
// @version     1.0.0
// @author      DdsT
// @downloadURL https://ddst.github.io/HFR_Filtre_AV/hfrfiltreav.user.js
// @updateURL   https://ddst.github.io/HFR_Filtre_AV/hfrfiltreav.meta.js
// @supportURL  https://ddst.github.io/HFR_Filtre_AV/
// @description Filtrer les sujets des catégories Achats & Ventes
// @icon        https://www.hardware.fr/images_skin_2010/facebook/logo.png
// @match       *://forum.hardware.fr/forum1.php*&cat=6*
// @match       *://forum.hardware.fr/forum1f.php*&cat=6*
// @match       *://forum.hardware.fr/forum1.php*&cat=5*&subcat=251*
// @match       *://forum.hardware.fr/forum1f.php*&cat=5*&subcat=251*
// @match       *://forum.hardware.fr/hfr/AchatsVentes*/liste_sujet-*.htm
// @match       *://forum.hardware.fr/hfr/JeuxVideo/Achat-Ventes/liste_sujet-*.htm
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM.getValue
// @grant       GM.setValue
// ==/UserScript==

/*
Copyright (C) 2020 DdsT

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see https://ddst.github.io/hfr_ColorTag/LICENSE.
*/

/* v1.0.0
 * ------
 * - Première version
 */

const STYLE = `
.av-hide {
  display : none;
}

.av-button {
  border    : 2px solid #bbb;
  margin    : 0px 1px;
  padding   : 1px 0px;
  width     : 106px;
  color     : #777;
  font-size : 10px;
}

.av-button-active {
  border      : 2px solid #000;
  color       : #000;
  font-weight : bold;
}

`;

const ROOT = document.getElementById("mesdiscussions");

/* Liste des catégories */
let categories = {
  achat   : true,
  vente   : true,
  echange : true,
  autre   : true,
};

const DEFAULTSTRING = JSON.stringify(categories);

/* Mots clefs pour le filtrage */
let keywords = {
  achat   : ["ach","rech"],
  vente   : ["vds","vente","vends","vendre", "vend]"],
  echange : ["ech","éch"],
};

/* Liste des topics par catégories */
let topics = {
  all     : [],
  achat   : [],
  vente   : [],
  echange : [],
  autre   : []
};

/* Rendre chacun des sujets interactif */
function decorate(node) {
  for (const topic of node.querySelectorAll(".sujet")) {
    let tags = topic.querySelector(".sujetCase3>.cCatTopic").textContent.match(/[\[,\(](.*?)[\],\)]/gm) || [];
    let other = true;
    topics.all.push(topic);
    for (let tag of tags) {
      tag = tag.toLowerCase();
      for (const cat of Object.keys(keywords)) {
        let isIncluded = false;
        for (const keyword of keywords[cat]) {
          isIncluded = isIncluded || tag.includes(keyword);
        }
        if (isIncluded) {
          topics[cat].push(topic);
          other = false;
        }
      }
    }
    if (other) topics.autre.push(topic);
  }
}

/* Mettre à jour l'affichage des topics */
function update() {
  for (const topic of topics.all) {
    topic.classList.add("av-hide");
  }
  for (const cat of Object.keys(categories)) {
    if (categories[cat]) {
      for (const topic of topics[cat]) {
        topic.classList.remove("av-hide");
      }
    }
  }
}

/* Créer un bouton de filtrage */
function createButton(name, cat) {
  let button = document.createElement("button");
  button.innerHTML = `${name} (${topics[cat].length+10})`;
  button.cat = cat;
  button.id = "av-" + cat;
  button.className = "av-button";
  button.onclick = toggle;
  if (categories[cat]) button.classList.add("av-button-active");
  ROOT.querySelector(".cBackHeader.fondForum1PagesHaut .left").appendChild(button);
}

function toggle() {
  categories[this.cat] = !categories[this.cat];
  this.classList.toggle("av-button-active");
  GM.setValue("categories", JSON.stringify(categories));
  update();
}

/* Lancer le script */
async function initialize() {
  const string = await GM.getValue("categories", DEFAULTSTRING);
  categories = JSON.parse(string);
  GM.addStyle(STYLE);
  decorate(ROOT);
  update();
  createButton("Achat", "achat");
  createButton("Vente", "vente");
  createButton("Échange", "echange");
  createButton("Autre", "autre");
}

initialize();
