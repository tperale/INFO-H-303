-- Tout les administrateur qui n'ont pas commenté 
-- tous les établissments qu'ils ont crée

SELECT a.username
FROM account AS a
WHERE a.admin=1
    AND a.username NOT IN (
        SELECT e.created_by
        FROM establishment AS e
            INNER JOIN comments AS c
                ON e.id = c.establishment_id
                    AND e.created_by != c.username
            GROUP BY c.username HAVING COUNT(c.establishment_id)>0
        )
; 
