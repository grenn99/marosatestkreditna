-- Update gift package translations

-- Update the first package (Osnovno darilo / Basic Gift)
UPDATE gift_packages
SET 
    name_de = 'Basis-Geschenk',
    name_hr = 'Osnovni poklon',
    description_de = 'Basis-Geschenkverpackung mit einem Produkt Ihrer Wahl.',
    description_hr = 'Osnovno poklon pakiranje s jednim proizvodom po vašem izboru.'
WHERE id = 1;

-- Update the second package (Premium darilo / Premium Gift)
UPDATE gift_packages
SET 
    name_de = 'Premium-Geschenk',
    name_hr = 'Premium poklon',
    description_de = 'Elegante Geschenkverpackung mit bis zu drei Produkten Ihrer Wahl.',
    description_hr = 'Elegantno poklon pakiranje s do tri proizvoda po vašem izboru.'
WHERE id = 2;

-- Update the third package (Luksuzno darilo / Luxury Gift)
UPDATE gift_packages
SET 
    name_de = 'Luxus-Geschenk',
    name_hr = 'Luksuzni poklon',
    description_de = 'Luxuriöse Geschenkbox mit bis zu fünf Produkten Ihrer Wahl und einer personalisierten Karte.',
    description_hr = 'Luksuzna poklon kutija s do pet proizvoda po vašem izboru i personaliziranom karticom.'
WHERE id = 3;
