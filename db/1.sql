-- Tout les utilisateurs qui aiment trois établissement que brenda apprécie.

-- Mais qui ne tient pas comptes des personnes qui commentent sur le même 
-- établissement 
SELECT DISTINCT c1.username
FROM comments AS c1
    INNER JOIN comments AS c2
        ON "Brenda"= c2.username
            AND c1.establishment_id=c2.establishment_id
            AND c2.rating>=4 AND c1.rating>=4
GROUP BY c1.username HAVING COUNT(c1.username)>=3;
