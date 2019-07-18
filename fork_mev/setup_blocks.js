'use strict';

/* global THREE */

function main() {


    // let tst_coin = makeCoin(0, 0);

    //render
    function render(time) {


        camera.fov -= 0.5;
        camera.updateProjectionMatrix();
        if (camera.fov <= 75) {
            state = "stable2"
            let sub_cubes = cubes.slice(cubes.length - forks.length + 1);
            sub_cubes.forEach((cube) => {
                cube.b.material.transparent = true;
                cube.b.material.opacity = 0;
            })
            cubes = cubes.concat(forks);
            cubes.forEach((cube) => cube.y += 1.5);
            // forks.forEach((cube) => cube.y += 3);
        }
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render); // this is a recursive call
}
requestAnimationFrame(render);
}

main();