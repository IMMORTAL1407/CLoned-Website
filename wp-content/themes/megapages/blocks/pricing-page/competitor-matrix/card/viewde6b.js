/**
 * Frontend scripting for the competitor matrix module
 */

class CompetitorMatrixCard {
    $competitorMatrixCard;
    $matrixCardPrice;

    constructor(element) {
        this.$competitorMatrixCard = $(element);
        this.$matrixCardPrice = $('.price .value', this.$competitorMatrixCard);

        this.$matrixCardPrice.text(CurrencyLocalizer.formatPrice(this.$matrixCardPrice.text(), 'EUR', 'narrowSymbol'));
    }
}
