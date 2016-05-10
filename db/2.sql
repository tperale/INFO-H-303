-- Tout les établissement qu'apprécie au moins un utilisateurs qui apprécie
-- tout les établissement que Brenda apprécie.

SELECT DISTINCT c.establishment_id
FROM comments AS c, account AS a
WHERE c.username=a.username
    AND c.rating >= 4
    AND a.username NOT IN (
        SELECT DISTINCT c1.username
        FROM comments AS c1
            INNER JOIN comments AS c2
                ON "Brenda"= c2.username
                    AND c1.establishment_id=c2.establishment_id
                    AND c2.rating>=4 AND c1.rating>=4
        WHERE c1.username=c2.username
    )
;

