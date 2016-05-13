-- R2 : Tous les établissements qu’apprécie au moins un utilisateur qui 
-- apprécie tous les établissements que "Brenda" apprécie.

SELECT DISTINCT e.name
FROM establishment AS e, comments AS c
WHERE e.id=c.establishment_id
    AND c.username IN (
        SELECT c2.username
        FROM comments AS c1
        INNER JOIN comments AS c2
            ON c1.establishment_id=c2.establishment_id
                AND c1.username!=c2.username
                AND c2.rating>=4
        WHERE c1.username="Brenda"
            AND c1.rating>=4
        GROUP BY c2.username HAVING 
            COUNT(c2.username)=COUNT(DISTINCT c1.establishment_id)
    )
;
