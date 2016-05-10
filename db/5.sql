-- La liste des établissements ayant au minimum trois commentaires,
-- classée selon la moyenne des scores attribués.

SELECT AVG(c.rating), c.establishment_id
FROM comments AS c
GROUP BY c.establishment_id HAVING COUNT(c.establishment_id)>=3
ORDER BY AVG(c.rating);
