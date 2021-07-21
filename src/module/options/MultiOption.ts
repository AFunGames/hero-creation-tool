import { StepEnum } from '../Step';
import { ActorDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData';
import SelectableOption from './SelectableOption';
import HeroOption, { apply } from './HeroOption';
import InputOption from './TextInputOption';

/**
 * Represents an array of values selected by the player for the created actor.
 * (e.g. A class allowing to pick 2 skills from a list)
 * @class
 */
export default class MultiOption implements HeroOption {
  constructor(
    readonly origin: StepEnum,
    readonly key: string,
    private options: { key: string; value: string }[],
    private quantity: number,
    private label: string,
    readonly settings: {
      addValues: boolean;
      expandable?: boolean;
      customizable?: boolean;
    } = { addValues: false, expandable: false, customizable: false },
  ) {}

  isFulfilled() {
    return this.value().length > 0;
  }

  applyToHero(actor: ActorDataConstructorData) {
    this.optionList.forEach((v) => apply(actor, v.key, v.value(), this.settings.addValues));
  }

  optionList!: HeroOption[];
  $container!: JQuery;

  /**
   * Builds the HTML element for this option and appends it to the parent
   * @param {JQuery} $p
   */
  render($parent: JQuery): void {
    this.$container = $(`<div class="hct-options-container">`);
    const $titleDiv = $('<div class="hct-flex hct-flex-justify-sb hct-width-full" data-hct_opt_container_title>');
    const $title = $(`<p class="hct-options-container-label">${this.label}</p>`);
    $titleDiv.append($title);

    if (this.settings.expandable) {
      const $addButton = $(
        '<button class="hct-no-border hct-no-background hct-width-fit"><i class="fas fa-plus"></i></button>',
      );
      $addButton.on('click', () => {
        if (!this.settings.customizable) {
          this.addOption();
        } else {
          const d = new Dialog({
            title: game.i18n.localize('HCT.Common.ProfDialogTitle'),
            content: `<p>${game.i18n.localize('HCT.Common.ProfDialogContent')}</p>`,
            buttons: {
              standard: {
                label: game.i18n.localize('HCT.Common.AddStandard'),
                callback: () => this.addOption(),
              },
              custom: {
                label: game.i18n.localize('HCT.Common.AddCustom'),
                callback: () => this.addCustomOption(),
              },
            },
            default: 'standard',
            // close: html => console.log("This always is logged no matter which option is chosen") // might use this later
          });
          d.render(true);
        }
      });
      $titleDiv.append($addButton);

      // this.$buttonGroup = $('<div class="hct-options-container-buttongroup">');

      // if (this.settings.customizable) {
      //   const $customButtom = $('<button class="hct-options-container-button">').html(
      //     `${game.i18n.localize('HCT.Common.AddCustom')}`,
      //   );
      //   $customButtom.on('click', () => this.addCustomOption());
      //   this.$buttonGroup.append($customButtom);
      // }

      // const $addButton = $('<button class="hct-options-container-button">').html(
      //   `${game.i18n.localize('HCT.Common.AddStandard')}`,
      // );
      // $addButton.on('click', () => this.addOption());
      // this.$buttonGroup.append($addButton);

      // $parent.append(this.$buttonGroup);
    }
    this.$container.append($titleDiv);

    this.optionList = [];
    for (let i = 0; i < this.quantity; i++) {
      const o = new SelectableOption(this.origin, this.key, this.options, ' ', {
        ...this.settings,
        customizable: false,
      });
      this.optionList.push(o);
      o.render(this.$container);
    }

    $parent.append(this.$container);
  }

  addOption(): void {
    const o = new SelectableOption(this.origin, this.key, this.options, ' ', {
      ...this.settings,
      customizable: false,
    });
    this.optionList.push(o);
    o.render(this.$container);
  }

  addCustomOption(): void {
    const o = new InputOption(this.origin, this.key, '...', ' ', { ...this.settings, type: 'text' });
    this.optionList.push(o);
    o.render(this.$container);
  }

  /**
   * @returns the current value of this option
   */
  value(): any[] {
    const values: any[] = [];
    this.optionList.forEach((o) => values.push(o.value()));
    return values;
  }
}
